import type { ToolRunState } from '@push/api-client'

export const DRAFT_TOOL = 'draft_posting'

export const PENDING_TOOL_STATES: readonly ToolRunState[] = ['run', 'wait']

export const HTTP_TOO_MANY_REQUESTS = 429

export const DEFAULT_ACCESS_MODE = 'AUTO' as const
