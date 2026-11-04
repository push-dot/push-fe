import { CONVERT_TO_PROFILE, VIEW_PROFILE, applyNowLabel } from '../constants'

export type ResultSource = 'file' | 'profile'

export type ResultCard = {
  source: ResultSource
  company: string
  title: string
  meta: string
  documentId: string
}

export const resultButtons = (card: Pick<ResultCard, 'source' | 'company'>) =>
  card.source === 'file' ? [applyNowLabel(card.company), CONVERT_TO_PROFILE] : [applyNowLabel(card.company), VIEW_PROFILE]

const given = (name: string) => (/^[가-힣]{3}$/.test(name) ? name.slice(1) : name.slice(0, 2))

export const resultChrome = (card: Pick<ResultCard, 'source' | 'title'>) =>
  card.source === 'file' ? { share: true as const, initials: null } : { share: false as const, initials: given(card.title.split(' · ')[0] ?? '') }
