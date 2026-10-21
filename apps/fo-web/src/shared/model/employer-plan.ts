import { SEAT_LIMIT_NONE, SEAT_LIMIT_PRO, SEAT_LIMIT_ULTRA } from './constants'

export const PLAN_NAME = { BASIC: 'Basic', PRO: 'Pro', ULTRA: 'Ultra' } as const

export const ROLE_NAME = { ADMIN: '관리자', MEMBER: '담당자' } as const

export type EmployerPlanId = 'BASIC' | 'PRO' | 'ULTRA' | null

export const canInterviewPrep = (plan: EmployerPlanId): boolean =>
  plan === 'PRO' || plan === 'ULTRA'

export const canUploadExternalPdf = (plan: EmployerPlanId): boolean => plan === 'ULTRA'

export const canUseEmployerAi = (verified: boolean): boolean => verified

export const seatLimit = (plan: EmployerPlanId): number =>
  plan === 'ULTRA' ? SEAT_LIMIT_ULTRA : plan === 'PRO' ? SEAT_LIMIT_PRO : SEAT_LIMIT_NONE

export const canInvite = (plan: EmployerPlanId, used: number): boolean => used < seatLimit(plan)
