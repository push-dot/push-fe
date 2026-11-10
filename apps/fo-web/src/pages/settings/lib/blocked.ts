import type { BlockedUser, ListEnvelope } from '@push/api-client'

export const blockedCount = (total: number | undefined) => (total === undefined ? '' : `${total}명`)

export const blockedLine = (createdAt: string, now = new Date()) => {
  const date = new Date(createdAt)
  const day = `${date.getMonth() + 1}월 ${date.getDate()}일`
  return `${date.getFullYear() === now.getFullYear() ? day : `${date.getFullYear()}년 ${day}`} 차단`
}

export const withoutBlocked = (envelope: ListEnvelope<BlockedUser> | undefined, userId: string) => {
  if (!envelope) return envelope
  const data = envelope.data.filter((item) => item.user.id !== userId)
  const removed = envelope.data.length - data.length
  return { ...envelope, data, page: { ...envelope.page, total: envelope.page.total === undefined ? undefined : envelope.page.total - removed } }
}
