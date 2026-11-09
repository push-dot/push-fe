import type { IconName } from '../shared/ui/icon'
import { NAV } from './constants'

export type TabItem = { to: string; label: string; icon: IconName; lock?: boolean }

const BASE: TabItem[] = [
  { to: '/', label: NAV.home, icon: 'home' },
  { to: '/jobs', label: NAV.jobs, icon: 'brief' },
  { to: '/hub', label: NAV.hub, icon: 'people' },
  { to: '/social', label: NAV.social, icon: 'chat' },
]

export const tabItems = (kind: 'guest' | 'personal' | 'employer'): TabItem[] => {
  if (kind === 'guest') return BASE.map((item) => (item.to === '/hub' || item.to === '/social' ? { ...item, lock: true } : item))
  if (kind === 'personal') return [...BASE, { to: '/me', label: NAV.my, icon: 'user' }]
  return [
    ...BASE,
    { to: '/employer/chat', label: NAV.chat, icon: 'spark' },
    { to: '/employer/postings', label: NAV.postings, icon: 'doc' },
  ]
}

const SECTIONS: Record<string, RegExp> = {
  '/': /^\/(notifications)?$/,
  '/jobs': /^\/jobs(\/|$)/,
  '/hub': /^\/hub(\/|$)/,
  '/social': /^\/(social|posts)(\/|$)/,
  '/me': /^\/(me|settings)(\/|$)/,
  '/employer/chat': /^\/employer\/chat(\/|$)/,
  '/employer/postings': /^\/employer\/postings(\/|$)/,
}

export const tabOn = (pathname: string, to: string) => SECTIONS[to]?.test(pathname) ?? false

const STICKY_ACTION = [
  /^\/postings\/[^/]+$/,
  /^\/profiles\/[^/]+$/,
  /^\/offers\/[^/]+$/,
  /^\/employer\/postings\/new$/,
  /^\/employer\/postings\/[^/]+\/edit$/,
  /^\/employer\/postings\/[^/]+\/applicants\/[^/]+$/,
]

export const tabBarShown = (pathname: string) => !STICKY_ACTION.some((pattern) => pattern.test(pathname))
