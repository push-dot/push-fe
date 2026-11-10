import { relativeTime } from '../../../shared/lib/format'

const WEEK_MS = 7 * 24 * 3600 * 1000

/** WebMyPosts boards: posts older than a week read 1주 전…4주 전, then the date. */
export const postAge = (iso: string, now = Date.now()) => {
  const weeks = Math.floor((now - new Date(iso).getTime()) / WEEK_MS)
  return weeks >= 1 && weeks <= 4 ? `${weeks}주 전` : relativeTime(iso, now)
}
