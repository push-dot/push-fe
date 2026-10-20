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
  /** Called once on 401. Return true when a new token is ready so the request retries. */
  refresh?: () => Promise<boolean>
  fetch?: typeof fetch
  uuid?: () => string
}

export type Client = ReturnType<typeof createClient>

const toSearch = (query?: Query): string => {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    // Multi-value filters are sent comma-joined (api-spec: category=a,b).
    params.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

export const createClient = (config: ClientConfig) => {
  const doFetch = config.fetch ?? globalThis.fetch.bind(globalThis)
  const uuid = config.uuid ?? (() => globalThis.crypto.randomUUID())
  const base = config.baseUrl.replace(/\/+$/, '')

  const send = async (method: string, path: string, options: RequestOptions = {}, retried = false): Promise<Response> => {
    const headers: Record<string, string> = { Accept: 'application/json', ...options.headers }
    const token = await config.getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    let body: BodyInit | undefined
    if (options.form) body = options.form
    else if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
    // Every authed POST needs a key; reuse the caller's key on retries.
    const key = options.idempotencyKey ?? (method === 'POST' && !path.endsWith('/stream') ? uuid() : undefined)
    if (key) headers['Idempotency-Key'] = key
    const res = await doFetch(`${base}/${path.replace(/^\/+/, '')}${toSearch(options.query)}`, {
      method,
      headers,
      body,
      signal: options.signal,
    })
    if (res.status === 401 && !retried && config.refresh && (await config.refresh())) {
      return send(method, path, { ...options, idempotencyKey: key }, true)
    }
    if (!res.ok) throw await toError(res)
    return res
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

const toError = async (res: Response): Promise<ApiError> => {
  try {
    const body = (await res.json()) as { error?: ApiErrorBody }
    if (body.error) return new ApiError(body.error.message, body.error.code, res.status, body.error.details)
  } catch {
    // fall through to a generic error
  }
  return new ApiError(res.statusText || 'request failed', 'HTTP_ERROR', res.status)
}
