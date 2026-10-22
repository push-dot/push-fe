import { DEFAULT_RETURN_TO } from './constants'

export const sanitizeReturnTo = (value: string | null | undefined): string => {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('://') ||
    value.includes('\\')
  ) {
    return DEFAULT_RETURN_TO
  }
  return value
}
