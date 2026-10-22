import {
  EMPLOYER_LOGIN_PATHS,
  INVITE_PATH,
  POSTING_PUBLIC_PATH,
  PUBLIC_PATHS,
  VERIFIED_EMPLOYER_PATHS,
} from './constants'

export type AccountType = 'PERSONAL' | 'EMPLOYER'

const publicPaths = new Set<string>(PUBLIC_PATHS)

const pathUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`)

export const isPublicPath = (pathname: string): boolean =>
  publicPaths.has(pathname) || POSTING_PUBLIC_PATH.test(pathname)

export const needsLogin = (pathname: string, authed: boolean): boolean =>
  !authed && !isPublicPath(pathname)

export const employerGate = (
  pathname: string,
  account: { accountType: AccountType; verified: boolean } | null,
): 'ok' | 'login' | 'verify' => {
  const needsVerified = VERIFIED_EMPLOYER_PATHS.some((base) => pathUnder(pathname, base))
  const needsEmployer =
    needsVerified ||
    EMPLOYER_LOGIN_PATHS.some((base) => pathUnder(pathname, base)) ||
    INVITE_PATH.test(pathname)
  if (!needsEmployer) return 'ok'
  if (!account || account.accountType !== 'EMPLOYER') return 'login'
  if (needsVerified && !account.verified) return 'verify'
  return 'ok'
}
