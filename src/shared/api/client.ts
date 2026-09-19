import ky from 'ky'
import { API_BASE_URL } from '../constants'
import { getAccessToken, useSessionStore } from '../auth/session'
import type { DataEnvelope } from './envelope'
import type { Session } from '../auth/session'

let refreshing: Promise<Session> | null = null

const refreshSession = (): Promise<Session> => {
  refreshing ??= ky
    .post(`${API_BASE_URL}auth/refresh`, {
      json: { refreshToken: useSessionStore.getState().session?.refreshToken ?? '' },
    })
    .json<DataEnvelope<Session>>()
    .then((env) => env.data)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 15_000,
  retry: {
    limit: 1,
    methods: ['get'],
    statusCodes: [408, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (req) => {
        const token = getAccessToken()
        if (token) req.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
    afterResponse: [
      async (req, _options, res) => {
        if (res.status !== 401 || req.url.includes('/auth/')) return
        if (!useSessionStore.getState().session?.refreshToken) {
          useSessionStore.getState().clearSession()
          return
        }
        try {
          const session = await refreshSession()
          useSessionStore.getState().setSession(session)
          req.headers.set('Authorization', `Bearer ${session.accessToken}`)
          return ky(req)
        } catch {
          useSessionStore.getState().clearSession()
        }
      },
    ],
  },
})
