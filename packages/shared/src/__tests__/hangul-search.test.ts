import { describe, expect, it } from 'vitest'
import { matchHangul, searchHangul } from '../index'

describe('matchHangul', () => {
  it('matches choseong', () => {
    expect(matchHangul('모아페이', 'ㅁㅇㅍㅇ')).toMatchObject({ kind: 'choseong', start: 0, end: 4 })
    expect(matchHangul('결제 백엔드 엔지니어', 'ㅂㅇㄷ')).toMatchObject({ kind: 'choseong', start: 3, end: 6 })
  })
  it('matches a syllable still being typed', () => {
    expect(matchHangul('백엔드 엔지니어', '백ㅇ')).toMatchObject({ kind: 'jamo', start: 0, end: 2 })
    expect(matchHangul('모아페이', '모앞')).toMatchObject({ kind: 'jamo', start: 0, end: 3 })
  })
  it('matches qwerty typed with the wrong input mode', () => {
    expect(matchHangul('모아페이', 'ahdkvpdl')).toMatchObject({ kind: 'qwerty' })
  })
  it('prefers exact and prefix over contains', () => {
    expect(matchHangul('결제', '결제')?.kind).toBe('exact')
    expect(matchHangul('결제 승인 API', '결제')?.kind).toBe('prefix')
    expect(matchHangul('카드 결제', '결제')).toMatchObject({ kind: 'contains', start: 3, end: 5 })
    expect(matchHangul('Kotlin', 'kot')?.kind).toBe('prefix')
  })
  it('returns null on no match', () => {
    expect(matchHangul('모아페이', 'ㅋㅋ')).toBeNull()
  })
  it('ranks an exact match ahead of choseong', () => {
    expect(matchHangul('결제', '결제')!.rank).toBeLessThan(matchHangul('결제', 'ㄱㅈ')!.rank)
  })
  it('highlights the WebSearch span for 백엔드', () => {
    const marked = (text: string) => {
      const match = matchHangul(text, '백엔드')
      return match ? text.slice(match.start, match.end) : null
    }
    expect(matchHangul('백엔드 엔지니어 (Kotlin·Spring)', '백엔드')).toMatchObject({ kind: 'prefix', start: 0, end: 3 })
    expect(matchHangul('백엔드 개발자', '백엔드')).toMatchObject({ kind: 'prefix', start: 0, end: 3 })
    expect(matchHangul('결제 시스템을 만드는 백엔드 개발자 · 5년', '백엔드')).toMatchObject({
      kind: 'contains',
      start: 12,
      end: 15,
    })
    expect(matchHangul('백엔드 · 데이터 파이프라인 · 3년', '백엔드')).toMatchObject({ kind: 'prefix', start: 0, end: 3 })
    expect(marked('백엔드 엔지니어 (Kotlin·Spring)')).toBe('백엔드')
    expect(marked('백엔드 개발자')).toBe('백엔드')
    expect(marked('결제 시스템을 만드는 백엔드 개발자 · 5년')).toBe('백엔드')
    expect(marked('백엔드 · 데이터 파이프라인 · 3년')).toBe('백엔드')
    expect(matchHangul('서버 개발자 (Go)', '백엔드')).toBeNull()
    expect(matchHangul('물류 데이터 엔지니어', '백엔드')).toBeNull()
  })
})

describe('searchHangul', () => {
  it('ranks results and drops non-matches', () => {
    const items = ['카드 결제', '결제', '모아페이', '결제 승인']
    const out = searchHangul(items, '결제', (s) => [s]).map((r) => r.item)
    expect(out).toEqual(['결제', '결제 승인', '카드 결제'])
  })
  it('ranks an exact match before a choseong match', () => {
    const out = searchHangul(['결제', 'ㄱㅈ'], 'ㄱㅈ', (item) => [item]).map((row) => row.item)
    expect(out).toEqual(['ㄱㅈ', '결제'])
  })
})
