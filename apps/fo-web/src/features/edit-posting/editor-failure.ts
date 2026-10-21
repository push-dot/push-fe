import { ApiError } from '@push/api-client'
import { EDITOR_FAILED } from './constants'

export const editorFailure = (error: unknown) => {
  if (error instanceof ApiError && (error.status === 409 || error.code === 'REVISION_CONFLICT')) return error.message
  return EDITOR_FAILED
}
