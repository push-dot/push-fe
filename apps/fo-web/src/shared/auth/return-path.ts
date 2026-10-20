import type { Session } from '@push/api-client'
import { employerGate } from '../model/access'
import { sanitizeReturnTo } from '../model/return-to'
import { AUTH_ENTRY_PATHS, RETURN_TO_KEY } from './constants'

const authEntries = new Set<string>(AUTH_ENTRY_PATHS)

export const saveReturnTo = (value: string) => {
  sessionStorage.setItem(RETURN_TO_KEY, sanitizeReturnTo(value))
}

export const takeReturnTo = () => {
  const stored = sessionStorage.getItem(RETURN_TO_KEY)
  sessionStorage.removeItem(RETURN_TO_KEY)
  return sanitizeReturnTo(stored)
}

export const gateAccount = (session: Session | null) => {
  const accountType = session?.user.accountType
  if (!session || !accountType) return null
  return {
    accountType,
    verified: accountType === 'EMPLOYER' && Boolean(session.user.companyId),
  }
}

export const pathAfterAuth = (target: string, session: Session) => {
  const safe = sanitizeReturnTo(target)
  const pathname = safe.split('?')[0] ?? '/'
  if (authEntries.has(pathname)) return '/'
  const gate = employerGate(pathname, gateAccount(session))
  if (gate === 'verify') return '/employer/verify'
  if (gate === 'login') return '/'
  return safe
}
