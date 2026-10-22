import { NAV } from './constants'

export const EMPLOYER_LINKS = [
  { to: '/employer/chat', label: NAV.chat },
  { to: '/employer/postings', label: NAV.postings },
] as const

export const topEndLinks = (signedIn: boolean) => [
  { to: '/search', label: NAV.search },
  ...(signedIn ? [{ to: '/notifications', label: NAV.notifications }] : []),
]
