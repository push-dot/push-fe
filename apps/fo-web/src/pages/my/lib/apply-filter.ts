import type { Application, ApplicationStage } from '@push/api-client'

export type ApplyFilter = 'all' | 'active' | 'done'

const DONE_STAGES: ApplicationStage[] = ['OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']

const phase = (stage: ApplicationStage): Exclude<ApplyFilter, 'all'> => (DONE_STAGES.includes(stage) ? 'done' : 'active')

export const applyCounts = (items: Pick<Application, 'stage'>[]): Record<ApplyFilter, number> => {
  const done = items.filter((item) => phase(item.stage) === 'done').length
  return { all: items.length, active: items.length - done, done }
}

export const filterApplications = <T extends Pick<Application, 'stage'>>(items: T[], filter: ApplyFilter) =>
  filter === 'all' ? items : items.filter((item) => phase(item.stage) === filter)

export const stageTone = (stage: ApplicationStage) => {
  if (stage === 'SCREENING') return 'ac'
  if (stage === 'INTERVIEW') return 'orange'
  if (stage === 'OFFER' || stage === 'ACCEPTED') return 'green'
  if (stage === 'REJECTED' || stage === 'WITHDRAWN') return 'red'
  return 'grey'
}

export const appliedLine = (item: Pick<Application, 'company' | 'appliedAt' | 'createdAt'>) => {
  const date = new Date(item.appliedAt ?? item.createdAt)
  return `${item.company} · ${date.getMonth() + 1}월 ${date.getDate()}일 지원`
}
