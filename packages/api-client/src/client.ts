import ky, { HTTPError, type KyInstance } from 'ky'
import {
  HTTP_UNAUTHORIZED,
  IDEMPOTENCY_KEY_HEADER,
  MULTI_VALUE_QUERY_SEPARATOR,
  REQUEST_TIMEOUT_DISABLED,
  RETRY_LIMIT,
} from './constants'
import { ApiError, type ApiErrorBody } from './errors'

type Query = Record<string, string | number | boolean | string[] | undefined | null>

export type RequestOptions = {
  query?: Query
  body?: unknown
  form?: FormData
  signal?: AbortSignal
  idempotencyKey?: string
  headers?: Record<string, string>
}

export type ClientConfig = {
  baseUrl: string
  getToken: () => string | null | undefined | Promise<string | null | undefined>
  refresh?: () => Promise<boolean>
  fetch?: typeof fetch
  uuid?: () => string
}

export type Client = ReturnType<typeof createClient>

const toSearch = (query?: Query) => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, Array.isArray(value) ? value.join(MULTI_VALUE_QUERY_SEPARATOR) : String(value))
  }
  return params
}

export const createClient = (config: ClientConfig) => {
  const uuid = config.uuid ?? (() => globalThis.crypto.randomUUID())

  const http: KyInstance = ky.create({
    prefixUrl: config.baseUrl.replace(/\/+$/, ''),
    fetch: config.fetch,
    timeout: REQUEST_TIMEOUT_DISABLED,
    retry: { limit: RETRY_LIMIT, methods: [], statusCodes: [] },
    headers: { Accept: 'application/json' },
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await config.getToken()
          if (token) request.headers.set('Authorization', `Bearer ${token}`)
        },
      ],
      afterResponse: [
        async (request, _options, response, { retryCount }) => {
          if (response.status !== HTTP_UNAUTHORIZED || !config.refresh || retryCount >= RETRY_LIMIT) return
          if (!(await config.refresh())) return
          const headers = new Headers(request.headers)
          const token = await config.getToken()
          if (token) headers.set('Authorization', `Bearer ${token}`)
          return ky.retry({ request: new Request(request, { headers }), code: 'TOKEN_REFRESHED', delay: 0 })
        },
      ],
    },
  })

  const send = async (method: string, path: string, options: RequestOptions = {}): Promise<Response> => {
    const headers: Record<string, string> = { ...options.headers }
    const key = options.idempotencyKey ?? (method === 'POST' && !path.endsWith('/stream') ? uuid() : undefined)
    if (key) headers[IDEMPOTENCY_KEY_HEADER] = key
    try {
      return await http(path.replace(/^\/+/, ''), {
        method,
        headers,
        searchParams: toSearch(options.query),
        json: options.form || options.body === undefined ? undefined : options.body,
        body: options.form,
        signal: options.signal,
      })
    } catch (error) {
      throw await toApiError(error)
    }
  }

  const json = async <T>(method: string, path: string, options?: RequestOptions): Promise<T> => {
    const res = await send(method, path, options)
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  return {
    raw: send,
    get: <T>(path: string, options?: RequestOptions) => json<T>('GET', path, options),
    post: <T>(path: string, options?: RequestOptions) => json<T>('POST', path, options),
    patch: <T>(path: string, options?: RequestOptions) => json<T>('PATCH', path, options),
    put: <T>(path: string, options?: RequestOptions) => json<T>('PUT', path, options),
    delete: <T>(path: string, options?: RequestOptions) => json<T>('DELETE', path, options),
  }
}

const toApiError = async (error: unknown): Promise<ApiError> => {
  if (error instanceof ApiError) return error
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.clone().json()) as { error?: ApiErrorBody }
      if (body.error) return new ApiError(body.error.message, body.error.code, error.response.status, body.error.details)
    } catch {
    }
    return new ApiError(error.response.statusText || 'request failed', 'HTTP_ERROR', error.response.status)
  }
  if (error instanceof Error && error.name === 'AbortError') return new ApiError('aborted', 'ABORTED', 0)
  return new ApiError(error instanceof Error ? error.message : 'network error', 'NETWORK_ERROR', 0)
}
