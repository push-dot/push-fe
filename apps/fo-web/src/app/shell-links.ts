import { NAV } from './constants'

export const topEndLinks = (signedIn: boolean) => [
  { to: '/search', label: NAV.search },
  ...(signedIn ? [{ to: '/notifications', label: NAV.notifications }] : []),
]
