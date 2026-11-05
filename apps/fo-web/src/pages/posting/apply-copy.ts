export const APPLY_GUIDANCE = '지원하면 마이 › 내 활동 › 지원활동에 기록돼요.'
export const APPLY_PENDING = '지원하는 중…'
export const APPLY_FAILURE = '지원하지 못했어요. 잠시 후 다시 눌러 주세요.'
export const TAILORED_DOC = '에이전트로 맞춘 서류'

export const applyPair = (company?: string | null, title?: string | null) =>
  [company, title].filter((part): part is string => Boolean(part)).join(' · ')

const seoulDay = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date)
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { year: value('year'), month: value('month'), day: value('day') }
}

export const seoulWhen = (createdAt: string, now = new Date()) => {
  const created = seoulDay(new Date(createdAt))
  const today = seoulDay(now)
  if (created.year === today.year && created.month === today.month && created.day === today.day) return '오늘'
  return `${created.month}월 ${created.day}일`
}

export const sourceSub = (origin: string, createdAt?: string | null, now = new Date()) => {
  if (origin !== 'AI') return '원본'
  if (!createdAt) return TAILORED_DOC
  return `${TAILORED_DOC} · ${seoulWhen(createdAt, now)}`
}

/** Choosing the selected radio again leaves it selected. */
export const keepRadio = (current: string | null, id: string) => (current === id ? current : id)

/** The extra line is the selected row's kind, and only when kind is a non-empty string. */
export const kindLine = (kind?: string | null) => (kind && kind.length > 0 ? kind : null)
