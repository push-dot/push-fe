import { JOB_CATEGORIES, type ApplicantCounts, type ApplicantDetail, type ApplicantDocumentKind, type ApplicantSummary, type ApplicationStage } from '@push/api-client'

import { DOC_FILE, DOC_PDF, DOC_PROFILE, FILTER_ALL, STAGE_APPLIED } from './constants'
import { EMPLOYER_STAGE_ACTIONS } from '../../shared/model/applicant-stage'

type Tone = 'ac' | 'red' | 'grey'

export const DOC_BADGE: Record<ApplicantDocumentKind, { label: string; tone: Tone }> = {
  PROFILE: { label: DOC_PROFILE, tone: 'ac' },
  PDF: { label: DOC_PDF, tone: 'red' },
  FILE: { label: DOC_FILE, tone: 'grey' },
}

const STAGE_TONE: Record<ApplicationStage, string> = {
  DISCOVERED: 'grey',
  PREPARING: 'grey',
  READY: 'grey',
  APPLIED: 'grey',
  SCREENING: 'ac',
  INTERVIEW: 'orange',
  OFFER: 'green',
  ACCEPTED: 'green',
  REJECTED: 'red',
  WITHDRAWN: 'red',
}

export const stageTone = (stage: ApplicationStage) => STAGE_TONE[stage]

// 개발 · 5년 · <headline>
export const applicantSub = (applicant: ApplicantSummary['applicant']) =>
  [
    JOB_CATEGORIES.find((item) => item.key === applicant.jobCategory)?.label,
    applicant.tenureYears ? `${applicant.tenureYears}년` : null,
    applicant.headline,
  ]
    .filter(Boolean)
    .join(' · ')

const COUNT_KEY = { APPLIED: 'applied', SCREENING: 'screening', INTERVIEW: 'interview', OFFER: 'offer', REJECTED: 'rejected' } as const

export type StageTab = { label: string; stage: ApplicationStage | null; count?: number }

export const stageTabs = (counts?: ApplicantCounts): StageTab[] => [
  { label: FILTER_ALL, stage: null, count: counts?.total },
  { label: STAGE_APPLIED, stage: 'APPLIED', count: counts?.[COUNT_KEY.APPLIED] },
  ...EMPLOYER_STAGE_ACTIONS.map((item) => ({ label: item.label, stage: item.stage, count: counts?.[COUNT_KEY[item.stage]] })),
]

const MONTH = /^(\d{4})-(\d{2})/

const monthIndex = (iso: string) => {
  const match = MONTH.exec(iso)
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : null
}

const dotted = (iso: string) => iso.slice(0, 7).replace('-', '.')

export type CareerRow = { key: string; title: string; period: string; summary: string }

// 2022.03 – 지금 · 4년 8개월 (start month through the end month, both counted)
export const careerRows = (careers: NonNullable<ApplicantDetail['applicant']>['careers'], now: number): CareerRow[] =>
  careers.map((career, index) => {
    const from = career.startedOn ? monthIndex(career.startedOn) : null
    const to = career.endedOn ? monthIndex(career.endedOn) : new Date(now).getFullYear() * 12 + new Date(now).getMonth()
    const months = from !== null && to !== null ? Math.max(to - from, 0) + 1 : 0
    const span = [months >= 12 ? `${Math.floor(months / 12)}년` : '', months % 12 ? `${months % 12}개월` : ''].filter(Boolean).join(' ')
    const range = career.startedOn ? `${dotted(career.startedOn)} – ${career.endedOn ? dotted(career.endedOn) : '지금'}` : ''
    return {
      key: `${career.company ?? ''}-${index}`,
      title: [career.company, career.role].filter(Boolean).join(' · '),
      period: [range, span].filter(Boolean).join(' · '),
      summary: career.description ?? '',
    }
  })

export type DocChip = { key: string; label: string; badge: { label: string; tone: Tone }; content: string; file: { id: string; name: string } | null }

// Text documents are the profile snapshot; attached files carry their page count.
export const docChips = (detail: Pick<ApplicantDetail, 'documents' | 'files'>): DocChip[] => [
  ...detail.documents.map((doc) => ({ key: doc.id, label: doc.title, badge: DOC_BADGE.PROFILE, content: doc.content, file: null })),
  ...(detail.files ?? []).map((file) => ({
    key: file.id,
    label: file.pageCount ? `${file.fileName} · ${file.pageCount}쪽` : file.fileName,
    badge: file.mimeType === 'application/pdf' ? DOC_BADGE.PDF : DOC_BADGE.FILE,
    content: '',
    file: { id: file.id, name: file.fileName },
  })),
]
