import { describe, expect, it } from 'vitest'
import { resultButtons, resultChrome } from '../utils/result-card'

const file = {
  source: 'file' as const,
  company: '모아페이',
  title: '김서준_모아페이_백엔드.pdf',
  meta: 'A4 1쪽 · 186KB · 내 서류에 자동 저장됨',
  documentId: 'src-1',
}

const profile = {
  source: 'profile' as const,
  company: '모아페이',
  title: '김서준 · 백엔드 엔지니어',
  meta: 'Push 프로필 · 방금 수정',
  documentId: 'd1',
}

describe('agent result cards', () => {
  it('shows the uploaded file meta and convert button, with no format badge', () => {
    expect(file.meta).toBe('A4 1쪽 · 186KB · 내 서류에 자동 저장됨')
    expect(resultButtons(file)).toEqual(['모아페이에 바로 지원하기', '프로필로 전환'])
    expect(resultButtons(file).join(' ')).not.toMatch(/PDF|DOCX|v1/)
    expect(resultChrome(file)).toEqual({ share: true, initials: null })
  })

  it('shows the profile card and the view button', () => {
    expect(profile.title).toBe('김서준 · 백엔드 엔지니어')
    expect(profile.meta).toBe('Push 프로필 · 방금 수정')
    expect(resultButtons(profile)).toEqual(['모아페이에 바로 지원하기', '프로필 보기'])
    expect(resultChrome(profile)).toEqual({ share: false, initials: '서준' })
  })
})
