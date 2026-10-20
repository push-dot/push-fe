export const DEFAULT_RETURN_TO = '/'

export const PUBLIC_PATHS = [
  '/',
  '/jobs',
  '/search',
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/verify',
  '/auth/reset',
] as const

export const POSTING_PUBLIC_PATH = /^\/postings\/[^/]+$/

export const VERIFIED_EMPLOYER_PATHS = ['/employer/postings', '/employer/chat'] as const

export const EMPLOYER_LOGIN_PATHS = [
  '/employer/verify',
  '/employer/members',
  '/employer/plans',
] as const

export const INVITE_PATH = /^\/invites\/[^/]+$/

export const SEAT_LIMIT_ULTRA = 5
export const SEAT_LIMIT_PRO = 2
export const SEAT_LIMIT_NONE = 0

export const BLOCKED_APPLICATION_STAGES = ['REJECTED', 'ACCEPTED', 'WITHDRAWN'] as const

export const EMPLOYER_STAGE_ACTIONS = [
  { label: '서류 통과', stage: 'SCREENING' },
  { label: '면접', stage: 'INTERVIEW' },
  { label: '합격', stage: 'OFFER' },
  { label: '불합격', stage: 'REJECTED' },
] as const
