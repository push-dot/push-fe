import { INVITE_PATH } from '../shared/model/constants'

const AUTH_PATHS = new Set(['/login', '/signup', '/auth/verify', '/auth/reset', '/employer/verify'])

export const isAuthChrome = (pathname: string) => AUTH_PATHS.has(pathname) || INVITE_PATH.test(pathname)
