import type { AccountType } from '@push/api-client'
import { browserSessionStorage } from '../../shared/lib/storage'
import type { OAuthProvider } from '../../shared/model/login-providers'
import { linkedProvider } from './phone'

const PENDING_LOGIN_KEY = 'push-oauth-pending'

export type PendingLogin = { provider: OAuthProvider; accountType: AccountType }

export const savePendingLogin = (pending: PendingLogin) => {
  browserSessionStorage()?.setItem(PENDING_LOGIN_KEY, JSON.stringify(pending))
}

export const readPendingLogin = (search: URLSearchParams): PendingLogin => {
  let stored: Partial<PendingLogin> = {}
  try {
    stored = JSON.parse(browserSessionStorage()?.getItem(PENDING_LOGIN_KEY) ?? '{}') as Partial<PendingLogin>
  } catch {
    stored = {}
  }
  const employer = stored.accountType === 'EMPLOYER' || search.get('accountType') === 'EMPLOYER'
  return { provider: linkedProvider(stored.provider) ?? 'google', accountType: employer ? 'EMPLOYER' : 'PERSONAL' }
}

export const clearPendingLogin = () => {
  browserSessionStorage()?.removeItem(PENDING_LOGIN_KEY)
}
