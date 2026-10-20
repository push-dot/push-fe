import { canInvite, seatLimit, type EmployerPlanId } from '../../shared/model/employer-plan'
import { INVITE_ADMIN_ONLY, INVITE_BASIC, inviteLimitCopy } from './constants'

export const inviteHint = (plan: EmployerPlanId, used: number, isAdmin: boolean): string | null => {
  if (!isAdmin) return INVITE_ADMIN_ONLY
  if (canInvite(plan, used)) return null
  const limit = seatLimit(plan)
  if (limit === 0) return INVITE_BASIC
  if (used >= limit) return inviteLimitCopy(used, limit)
  return null
}
