import ky, { HTTPError, TimeoutError, type KyInstance } from 'ky'
import {
  DEFAULT_RETRY_AFTER_SEC,
  DOT_SEGMENT,
  EVENT_STREAM_ACCEPT,
  HTTP_UNAUTHORIZED,
  QUEUE_BUSY,
  IDEMPOTENCY_KEY_HEADER,
  INVALID_PATH,
  MULTI_VALUE_QUERY_SEPARATOR,
  PARSE_ERROR,
  REQUEST_TIMEOUT_DISABLED,
  REQUEST_TIMEOUT_MS,
  RETRY_LIMIT,
  TIMEOUT_ERROR,
  UNSAFE_PATH_CHARACTER,
} from './constants'
import { ApiError, QueueBusyError, type ApiErrorBody } from './errors'

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

const isSafePath = (path: string) => path === path.trim() && !UNSAFE_PATH_CHARACTER.test(path) && !path.split('/').some((segment) => DOT_SEGMENT.test(segment))

export const createClient = (config: ClientConfig) => {
  const uuid = config.uuid ?? (() => globalThis.crypto.randomUUID())

  const http: KyInstance = ky.create({
    prefixUrl: config.baseUrl.replace(/\/+$/, ''),
    fetch: config.fetch,
    timeout: REQUEST_TIMEOUT_MS,
    retry: { limit: RETRY_LIMIT, methods: [], statusCodes: [] },
    headers: { Accept: 'application/json' },
    hooks: {
      beforeRequest: [
        async (request) => {
          // A caller's own token (a session not saved yet) wins over the stored one.
          if (request.headers.has('Authorization')) return
          const token = await config.getToken()
          if (token) request.headers.set('Authorization', `Bearer ${token}`)
        },
      ],
      afterResponse: [
        async (request, options, response, { retryCount }) => {
          if (response.status !== HTTP_UNAUTHORIZED || !config.refresh || retryCount >= RETRY_LIMIT) return
          // Refreshing renews the stored session, which is not the one a caller's own token belongs to.
          if (options.context.ownToken) return
          const token = await config.getToken()
          // A late 401 for a request sent with an older token: the session already moved on, so just resend.
          const stale = !!token && request.headers.get('Authorization') !== `Bearer ${token}`
          if (!stale && !(await config.refresh())) return
          const headers = new Headers(request.headers)
          const next = stale ? token : await config.getToken()
          if (next) headers.set('Authorization', `Bearer ${next}`)
          return ky.retry({ request: new Request(request, { headers }), code: 'TOKEN_REFRESHED', delay: 0 })
        },
      ],
    },
  })

  const send = async (method: string, path: string, options: RequestOptions = {}): Promise<Response> => {
    if (!isSafePath(path)) throw new ApiError('unsafe request path', INVALID_PATH, 0)
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
        timeout: new Headers(headers).get('Accept')?.includes(EVENT_STREAM_ACCEPT) ? REQUEST_TIMEOUT_DISABLED : REQUEST_TIMEOUT_MS,
        context: { ownToken: new Headers(options.headers).has('Authorization') },
      })
    } catch (error) {
      throw await toApiError(error)
    }
  }

  const json = async <T>(method: string, path: string, options?: RequestOptions): Promise<T> => {
    const res = await send(method, path, options)
    if (res.status === 204) return undefined as T
    try {
      return (await res.json()) as T
    } catch {
      throw new ApiError('invalid response body', PARSE_ERROR, res.status)
    }
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

const queueBusy = (body: ApiErrorBody, response: Response) => {
  const seconds = Number(body.details?.retryAfterSec ?? response.headers.get('Retry-After'))
  return new QueueBusyError(body.message, Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SEC, body.details)
}

const toApiError = async (error: unknown): Promise<ApiError> => {
  if (error instanceof ApiError) return error
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.clone().json()) as { error?: ApiErrorBody }
      if (body.error?.code === QUEUE_BUSY) return queueBusy(body.error, error.response)
      if (body.error) return new ApiError(body.error.message, body.error.code, error.response.status, body.error.details)
    } catch {
    }
    return new ApiError(error.response.statusText || 'request failed', 'HTTP_ERROR', error.response.status)
  }
  if (error instanceof TimeoutError) return new ApiError('request timed out', TIMEOUT_ERROR, 0)
  if (error instanceof Error && error.name === 'AbortError') return new ApiError('aborted', 'ABORTED', 0)
  return new ApiError(error instanceof Error ? error.message : 'network error', 'NETWORK_ERROR', 0)
}
