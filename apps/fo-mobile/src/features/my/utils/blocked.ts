import type { BlockedUser } from '@push/api-client'

export const BLOCKED_COPY = {
  title: '차단한 사람',
  intro: '차단한 사람은 나에게 제안이나 메시지를 보낼 수 없어요.',
  note: '차단을 풀어도 지난 제안은 다시 나타나지 않아요. 상대에게는 알리지 않아요.',
  empty: '차단한 사람이 없어요.',
  unblock: '차단 해제',
} as const

export const blockedCount = (total: number | undefined) => (total === undefined ? undefined : `${total}명`)

const blockedOn = (iso: string, now: Date) => {
  const d = new Date(iso)
  return d.getFullYear() === now.getFullYear()
    ? `${d.getMonth() + 1}월 ${d.getDate()}일`
    : `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

/** The row's second line: the company (when the server sends one) and the blocked date. */
export const blockedLine = (b: BlockedUser, now = new Date()) =>
  [b.user.companyName, `${blockedOn(b.createdAt, now)} 차단`].filter(Boolean).join(' · ')
