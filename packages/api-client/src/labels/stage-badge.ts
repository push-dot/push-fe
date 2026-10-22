import { REJECTED_BADGE, REJECTED_BADGE_STAGES } from '../constants'
import type { ApplicationStage } from '../types'

export const stageBadge = (stage: ApplicationStage): string => {
  switch (stage) {
    case 'APPLIED':
      return '지원함'
    case 'SCREENING':
      return '서류'
    case 'INTERVIEW':
      return '면접'
    case 'OFFER':
    case 'ACCEPTED':
      return '합격'
    case REJECTED_BADGE_STAGES[0]:
    case REJECTED_BADGE_STAGES[1]:
      return REJECTED_BADGE
    default:
      return '준비 중'
  }
}
