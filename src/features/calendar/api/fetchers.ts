import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { ListEnvelope, ListParams } from '@/shared/api'
import type { Operation } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import { createPkcePair } from '@/shared/lib/pkce'
import type { CalendarEvent, GoogleStatus } from './schemas'

const GOOGLE_REDIRECT_URI =
  '__TAURI_INTERNALS__' in window
    ? 'push://integrations/google/callback'
    : `${window.location.origin}/integrations/google/callback`

const GOOGLE_PKCE_KEY = 'push:google-pkce-verifier'

export const listCalendarEvents = async (
  params: ListParams & { from: string; to: string; applicationId?: string },
): Promise<ListEnvelope<CalendarEvent>> =>
  request(() =>
    api.get('calendar/events', {
      searchParams: {
        from: params.from,
        to: params.to,
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const fetchGoogleStatus = async (): Promise<GoogleStatus> =>
  (
    await request<{ data: GoogleStatus }>(() => api.get('integrations/google'))
  ).data

export const connectGoogle = async (): Promise<string> => {
  const { verifier, challenge } = await createPkcePair()
  const env = await request<{ data: { authorizationUrl: string } }>(() =>
    api.post('integrations/google/connect', {
      json: {
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
        redirectUri: GOOGLE_REDIRECT_URI,
      },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  sessionStorage.setItem(GOOGLE_PKCE_KEY, verifier)
  return env.data.authorizationUrl
}

export const completeGoogle = async (code: string): Promise<GoogleStatus> => {
  const codeVerifier = sessionStorage.getItem(GOOGLE_PKCE_KEY) ?? ''
  const env = await request<{ data: GoogleStatus }>(() =>
    api.post('integrations/google/complete', {
      json: { integrationCode: code, codeVerifier },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  sessionStorage.removeItem(GOOGLE_PKCE_KEY)
  return env.data
}

export const syncGoogle = async (): Promise<Operation> => {
  const env = await request<{ data: Operation }>(() =>
    api.post('integrations/google/sync', {
      json: {},
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}
