export type ApiErrorBody = {
  code: string
  message: string
  requestId?: string
  details?: Record<string, unknown> | null
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: Record<string, unknown> | null

  constructor(message: string, code: string, status: number, details?: Record<string, unknown> | null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export class QueueBusyError extends ApiError {
  readonly retryAfterSec: number

  constructor(message: string, retryAfterSec: number, details?: Record<string, unknown> | null) {
    super(message, 'QUEUE_BUSY', 429, details)
    this.name = 'QueueBusyError'
    this.retryAfterSec = retryAfterSec
  }
}
