import { ApiError } from '@push/api-client'

// POST auth/password/reset: 202 whether or not the email has an account, 429 when the shared mail bucket is full.
export const requestOutcome = (caught: unknown) => {
  if (caught === null) return 'sent'
  return caught instanceof ApiError && caught.status === 429 ? 'limit' : 'failed'
}

// Reset link lookup and confirm: 410 TOKEN_EXPIRED with details.email past the hour; an unknown or used link is 401.
export const linkOutcome = (
  caught: unknown,
): { view: 'form' } | { view: 'expired'; email: string } | { view: 'invalid' } => {
  if (!(caught instanceof ApiError)) return { view: 'form' }
  if (caught.code === 'TOKEN_EXPIRED')
    return { view: 'expired', email: String(caught.details?.email ?? '') }
  if (caught.status === 401) return { view: 'invalid' }
  return { view: 'form' }
}
