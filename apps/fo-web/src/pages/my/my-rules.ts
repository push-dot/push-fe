import {
  ApiError,
  type Career,
  type CareerStatus,
  type LinkKind,
  type SourceItem,
} from '@push/api-client'
import { fileSize, monthDay } from '@push/shared'
import { isPushDocument } from '../../features/manage-documents'
import { RESUME_MAX_BYTES, resumeFileError } from '../../features/upload-resume'
import { CAREER_NOW, DOCUMENT_DELETE, DOCUMENT_TOO_BIG, DOCUMENT_UPLOADING } from './constants'

const MONTHS_PER_YEAR = 12

export const splitDocuments = <T extends Pick<SourceItem, 'origin'>>(items: T[]) => ({
  push: items.filter(isPushDocument),
  uploads: items.filter((item) => !isPushDocument(item)),
})

const joinDot = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ')

export type PushDocAction = 'posting' | 'export' | 'rename' | 'remove'

export const pushDocGroups = (item: Pick<SourceItem, 'company'>): PushDocAction[][] => [
  item.company ? ['posting', 'export', 'rename'] : ['export', 'rename'],
  ['remove'],
]

export const pushDocumentMeta = (
  item: Pick<SourceItem, 'company' | 'postingTitle' | 'createdAt'>,
) => joinDot([item.company, item.postingTitle, monthDay(item.createdAt)])

export const uploadMeta = (item: Pick<SourceItem, 'createdAt' | 'size'>) =>
  joinDot([monthDay(item.createdAt), fileSize(item.size)])

export const fileExt = (fileName: string) =>
  fileName.includes('.') ? (fileName.split('.').pop() ?? '').toUpperCase() : 'FILE'

export const fileBadgeClass = (fileName: string) =>
  fileExt(fileName) === 'PDF' ? 'badge red' : 'badge ac'

export const uploadingMeta = (size: number) => joinDot([DOCUMENT_UPLOADING, fileSize(size)])

export const referencedByEvidence = (error: unknown) =>
  error instanceof ApiError &&
  error.status === 409 &&
  error.details?.reason === 'REFERENCED_BY_EVIDENCE'

export const documentDeleteNotice = (error: unknown) =>
  referencedByEvidence(error) ? DOCUMENT_DELETE.referenced : DOCUMENT_DELETE.failed

export const uploadProblem = (file: { name: string; type: string; size: number }) => {
  const typeError = resumeFileError({ name: file.name, type: file.type, size: 0 })
  if (typeError) return typeError
  return file.size > RESUME_MAX_BYTES ? DOCUMENT_TOO_BIG(fileSize(file.size)) : null
}

const yearMonth = (iso: string) => ({
  year: Number(iso.slice(0, 4)),
  month: Number(iso.slice(5, 7)),
})

const dotted = ({ year, month }: { year: number; month: number }) =>
  `${year}.${String(month).padStart(2, '0')}`

export const careerSpan = (career: Pick<Career, 'startedOn' | 'endedOn'>, today = new Date()) => {
  const start = yearMonth(career.startedOn)
  const end = career.endedOn
    ? yearMonth(career.endedOn)
    : { year: today.getFullYear(), month: today.getMonth() + 1 }
  const months = (end.year - start.year) * MONTHS_PER_YEAR + end.month - start.month + 1
  const length = [
    months >= MONTHS_PER_YEAR ? `${Math.floor(months / MONTHS_PER_YEAR)}년` : '',
    months % MONTHS_PER_YEAR ? `${months % MONTHS_PER_YEAR}개월` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return joinDot([`${dotted(start)} – ${career.endedOn ? dotted(end) : CAREER_NOW}`, length])
}

export const normalizeUrl = (value: string) => {
  const url = value.trim()
  return !url || /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export const linkHost = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

export const guessLinkKind = (url: string): LinkKind =>
  /github\.com/.test(url)
    ? 'github'
    : /velog|tistory|medium|brunch|blog/.test(url)
      ? 'blog'
      : /notion|portfolio|behance/.test(url)
        ? 'portfolio'
        : /career|jobs|recruit|wanted|saramin|jobkorea|greeting/.test(url)
          ? 'job'
          : 'other'

export const linkCompany = (title: string) => title.split(' · ')[0] ?? title

export const statusTone = (status: CareerStatus | null) =>
  status === 'seeking' ? 'green' : status === 'feedback' ? 'orange' : 'grey'

export const countLabel = (value: string, max: number) => `${[...value].length} / ${max}`
