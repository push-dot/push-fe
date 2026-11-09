import type { Career } from '@push/api-client'

const dotted = (iso: string) => `${iso.slice(0, 4)}.${iso.slice(5, 7)}`

const spanLabel = (months: number) => {
  const years = Math.floor(months / 12)
  const rest = months % 12
  return [years > 0 ? `${years}년` : null, rest > 0 ? `${rest}개월` : null].filter(Boolean).join(' ')
}

export const careerPeriod = (career: Pick<Career, 'startedOn' | 'endedOn'>, now = new Date()) => {
  const endYear = career.endedOn ? Number(career.endedOn.slice(0, 4)) : now.getFullYear()
  const endMonth = career.endedOn ? Number(career.endedOn.slice(5, 7)) : now.getMonth() + 1
  const months = (endYear - Number(career.startedOn.slice(0, 4))) * 12 + endMonth - Number(career.startedOn.slice(5, 7)) + 1
  return `${dotted(career.startedOn)} – ${career.endedOn ? dotted(career.endedOn) : '지금'} · ${spanLabel(Math.max(months, 1))}`
}
