import { postingsBookmark as call0, postingsUnbookmark as call1 } from '../../shared/api/operations'

export const postingsBookmark = (...args: Parameters<typeof call0>) => call0(...args)
export const postingsUnbookmark = (...args: Parameters<typeof call1>) => call1(...args)
