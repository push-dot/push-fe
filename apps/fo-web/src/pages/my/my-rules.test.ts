import { describe, expect, it } from 'vitest'
import {
  careerSpan,
  guessLinkKind,
  linkHost,
  normalizeUrl,
  pushDocGroups,
  pushDocumentMeta,
  splitDocuments,
  uploadingMeta,
  uploadMeta,
  uploadProblem,
} from './my-rules'

const MB = 1_000_000

describe('documents', () => {
  it('puts AI-made documents under Push 서류 and the rest under 올린 파일', () => {
    const items = [
      { id: 'a', origin: 'AI' },
      { id: 'u', origin: 'UPLOAD' },
      { id: 'b', origin: 'AI' },
    ]
    expect(splitDocuments(items)).toEqual({ push: [items[0], items[2]], uploads: [items[1]] })
  })

  it('offers 공고 보기 only when the document belongs to an application, and keeps 삭제하기 apart', () => {
    expect(pushDocGroups({ company: '토스페이먼츠' })).toEqual([
      ['posting', 'export', 'rename'],
      ['remove'],
    ])
    expect(pushDocGroups({ company: null })).toEqual([['export', 'rename'], ['remove']])
  })

  it('writes company · posting · date and drops the parts push-be leaves null', () => {
    expect(
      pushDocumentMeta({
        company: '모아페이',
        postingTitle: '백엔드 엔지니어',
        createdAt: '2026-10-20T01:00:00.000Z',
      }),
    ).toBe('모아페이 · 백엔드 엔지니어 · 10월 20일')
    expect(
      pushDocumentMeta({
        company: null,
        postingTitle: null,
        createdAt: '2026-10-20T01:00:00.000Z',
      }),
    ).toBe('10월 20일')
  })

  it('writes date · size for uploads without the 원본 prefix', () => {
    expect(uploadMeta({ createdAt: '2026-10-12T01:00:00.000Z', size: 2.4 * MB })).toBe(
      '10월 12일 · 2.4MB',
    )
    expect(uploadingMeta(1.8 * MB)).toBe('올리는 중 · 1.8MB')
  })

  it('names the size of a file over 20MB and keeps the type rule first', () => {
    expect(
      uploadProblem({ name: '포트폴리오_전체.pdf', type: 'application/pdf', size: 34.2 * MB }),
    ).toBe('20MB까지 올릴 수 있어요 · 이 파일은 34.2MB예요')
    expect(uploadProblem({ name: '사진.png', type: 'image/png', size: 34.2 * MB })).toBe(
      'PDF 또는 DOCX 파일만 올릴 수 있어요',
    )
    expect(uploadProblem({ name: '이력서.pdf', type: 'application/pdf', size: MB })).toBeNull()
  })
})

describe('profile', () => {
  it('writes a career period with its length, counting the current month', () => {
    const today = new Date(2026, 9, 21)
    expect(careerSpan({ startedOn: '2022-03-01', endedOn: null }, today)).toBe(
      '2022.03 – 지금 · 4년 8개월',
    )
    expect(careerSpan({ startedOn: '2021-01-01', endedOn: '2022-02-28' }, today)).toBe(
      '2021.01 – 2022.02 · 1년 2개월',
    )
    expect(careerSpan({ startedOn: '2026-10-01', endedOn: null }, today)).toBe(
      '2026.10 – 지금 · 1개월',
    )
  })
})

describe('links', () => {
  it('shows the address without the scheme and guesses the kind from it', () => {
    expect(linkHost('https://careers.moapay.kr/jobs/1182')).toBe('careers.moapay.kr/jobs/1182')
    expect(guessLinkKind('https://velog.io/@seojun/kafka-settle')).toBe('blog')
    expect(guessLinkKind('https://github.com/seojun-kim')).toBe('github')
    expect(guessLinkKind('https://example.com')).toBe('other')
    expect(normalizeUrl(' velog.io/@seojun ')).toBe('https://velog.io/@seojun')
    expect(normalizeUrl('http://a.kr')).toBe('http://a.kr')
  })
})
