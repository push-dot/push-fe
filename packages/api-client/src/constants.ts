import type { ApplicationStage } from './types'

export const REJECTED_BADGE = '불합격'

export const REJECTED_BADGE_STAGES = ['REJECTED', 'WITHDRAWN'] as const satisfies readonly ApplicationStage[]

export const HUB_CATEGORY_COUNT = 6

export const MULTI_VALUE_QUERY_SEPARATOR = ','

export const RETRY_LIMIT = 1

export const HTTP_UNAUTHORIZED = 401

export const REQUEST_TIMEOUT_DISABLED = false

export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key'

export const FRAME_SEPARATOR = /\r?\n\r?\n/
