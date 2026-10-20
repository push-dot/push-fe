import { BLOCKED_APPLICATION_STAGES, EMPLOYER_STAGE_ACTIONS } from './constants'

export type ApplicationStage =
  | 'DISCOVERED'
  | 'PREPARING'
  | 'READY'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export { EMPLOYER_STAGE_ACTIONS }

const blockedStages = new Set<ApplicationStage>(BLOCKED_APPLICATION_STAGES)

export const stageChangeBlocked = (stage: ApplicationStage): boolean => blockedStages.has(stage)
