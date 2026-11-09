import type { ListedSource } from '../../shared/api/sources'

export const APPLY_HINT = '프로필이나 서류 중 하나만 골라도 지원할 수 있어요.'
export const APPLY_LOCK = '지원한 뒤에는 서류를 고쳐도 회사에는 제출한 그대로 보여요.'
export const APPLY_SENDING = '보내는 중…'
export const APPLY_RETRY = '다시 보내기'
export const APPLY_ERROR_TITLE = '지원을 보내지 못했어요'
export const APPLY_ERROR_BODY = '연결이 잠시 끊겼어요. 고른 서류는 그대로 있으니 다시 보내 주세요.'
export const APPLY_CANCEL = '취소'
export const APPLY_CLOSE = '닫기'
export const GROUP_PROFILE = '프로필'
export const GROUP_PUSH = 'Push 서류'
export const GROUP_UPLOAD = '올린 파일'
export const PROFILE_TITLE = '내 프로필'
export const PUSH_BADGE = 'Push'
export const ORIGINAL_BADGE = '원본'
export const NO_DOCS_TITLE = '지원할 서류가 없어요'
export const NO_DOCS_BODY = '프로필을 채우거나 이력서 파일을 등록하면 바로 지원할 수 있어요.'
export const NO_DOCS_CTA = '서류 등록하기'
export const DOCS_PATH = '/me?tab=documents'
export const PROFILE_ID = 'profile'

export const applyConfirmLabel = (count: number) => `서류 ${count}개로 지원하기`

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

type Described = Pick<ListedSource, 'createdAt' | 'pageCount'> & { company?: string | null; postingTitle?: string | null }

export const pushDocSub = (source: Described, now = new Date()) =>
  [source.company, source.postingTitle, source.createdAt ? seoulWhen(source.createdAt, now) : null].filter(Boolean).join(' · ')

export const uploadSub = (source: Described, now = new Date()) =>
  [source.createdAt ? seoulWhen(source.createdAt, now) : null, source.pageCount ? `${source.pageCount}쪽` : null].filter(Boolean).join(' · ')

export const fileBadge = (fileName: string) => fileName.split('.').pop()?.toUpperCase() ?? ''

// a no-break space keeps 경력 2개 / 기술 8개 whole when the line wraps at 390
export const profileSub = (roleLine: string, careers: number, skills: number) =>
  [roleLine, `경력\u00a0${careers}개`, `기술\u00a0${skills}개`].filter(Boolean).join(' · ')

export const defaultPicked = (sources: Pick<ListedSource, 'id' | 'origin'>[]) => {
  const firstPush = sources.find((source) => source.origin === 'AI')
  return firstPush ? [PROFILE_ID, firstPush.id] : [PROFILE_ID]
}

// the profile row only counts once the profile has loaded; without it an empty pick would send an empty application
export const effectivePicks = (picked: string[] | null, sources: Pick<ListedSource, 'id' | 'origin'>[], hasProfile: boolean) =>
  (picked ?? defaultPicked(sources)).filter((id) => hasProfile || id !== PROFILE_ID)

export const togglePick = (picked: string[], id: string) => (picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id])
