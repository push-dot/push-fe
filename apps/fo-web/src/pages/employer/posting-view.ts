import { EMPLOYMENT_TYPES, type CompanyPosting, type PostingStatus } from '@push/api-client'
import { careerLabel } from '@push/shared'

import { AGENT_DRAFT, DEADLINE_NONE, DEADLINE_OPEN, STATUS_CLOSED, STATUS_DRAFT, STATUS_OPEN, draftBy, postedBy } from './constants'

export const STATUS_BADGE: Record<PostingStatus, { label: string; tone: 'green' | 'orange' | 'grey' }> = {
  OPEN: { label: STATUS_OPEN, tone: 'green' },
  DRAFT: { label: STATUS_DRAFT, tone: 'orange' },
  CLOSED: { label: STATUS_CLOSED, tone: 'grey' },
}

// Older servers send no status: closedAt tells open from closed.
export const statusOf = (posting: Pick<CompanyPosting, 'status' | 'closedAt'>): PostingStatus =>
  posting.status ?? (posting.closedAt ? 'CLOSED' : 'OPEN')

const dayStart = (at: Date) => new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()

export const agoLabel = (iso: string, now: number) => {
  const days = Math.round((dayStart(new Date(now)) - dayStart(new Date(iso))) / 86_400_000)
  if (days <= 0) return '오늘'
  if (days === 1) return '어제'
  return days < 30 ? `${days}일 전` : `${new Date(iso).getMonth() + 1}월 ${new Date(iso).getDate()}일`
}

export const dateLabel = (iso: string) => {
  const [, month, day] = iso.slice(0, 10).split('-').map(Number)
  return month && day ? `${month}월 ${day}일` : iso
}

export const subLine = (posting: CompanyPosting, now: number) => {
  const status = statusOf(posting)
  if (status === 'DRAFT') {
    const writer = posting.draftSource === 'AGENT' ? AGENT_DRAFT : posting.createdBy ? draftBy(posting.createdBy.displayName) : STATUS_DRAFT
    return `${writer} · ${agoLabel(posting.createdAt, now)}`
  }
  const career = careerLabel(posting)
  const employment = EMPLOYMENT_TYPES.find((item) => item.key === posting.employmentType)?.label
  return [career === '신입' ? career : `경력 ${career}`, employment, posting.createdBy ? postedBy(posting.createdBy.displayName) : null].filter(Boolean).join(' · ')
}

export const deadlineLabel = (posting: CompanyPosting) =>
  posting.deadline ? dateLabel(posting.deadline) : statusOf(posting) === 'OPEN' ? DEADLINE_OPEN : DEADLINE_NONE

export const FILTERS = [
  { key: 'all', status: null },
  { key: 'open', status: 'OPEN' },
  { key: 'draft', status: 'DRAFT' },
  { key: 'closed', status: 'CLOSED' },
] as const

export type PostingFilter = (typeof FILTERS)[number]['key']

export const filterRows = (rows: CompanyPosting[], filter: PostingFilter) => {
  const status = FILTERS.find((item) => item.key === filter)?.status
  return status ? rows.filter((row) => statusOf(row) === status) : rows
}
