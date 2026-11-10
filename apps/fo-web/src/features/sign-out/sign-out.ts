import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { authLogout } from '../../shared/api/operations'
import { sessionStore } from '../../shared/auth/session'

/**
 * Like the app's signOut: revokes the refresh token on push-be (best effort), then drops the session and every cached read
 * so the next account never sees this one's data. A deleted account skips the revoke; push-be already ended its sessions.
 */
export const signOut = async (queryClient: Pick<QueryClient, 'clear'>, { revoke = true } = {}) => {
  const refreshToken = sessionStore.load()?.refreshToken
  if (revoke && refreshToken) await authLogout(refreshToken).catch(() => undefined)
  sessionStore.clear()
  queryClient.clear()
}

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return async (options?: { revoke?: boolean }) => {
    await signOut(queryClient, options)
    navigate('/')
  }
}
