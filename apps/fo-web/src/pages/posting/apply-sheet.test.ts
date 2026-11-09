import { describe, expect, it } from 'vitest'
import {
  PROFILE_ID,
  applyConfirmLabel,
  applyPair,
  defaultPicked,
  effectivePicks,
  fileBadge,
  profileSub,
  pushDocSub,
  seoulWhen,
  togglePick,
  uploadSub,
} from './apply-copy'

const now = new Date('2026-11-05T03:00:00.000Z')

describe('apply sheet', () => {
  it('counts the picked rows in the confirm label', () => {
    expect(applyConfirmLabel(3)).toBe('서류 3개로 지원하기')
    expect(applyConfirmLabel(1)).toBe('서류 1개로 지원하기')
  })

  it('picks the profile and the first Push document by default', () => {
    expect(defaultPicked([{ id: 'u1', origin: 'UPLOAD' }, { id: 'a1', origin: 'AI' }, { id: 'a2', origin: 'AI' }])).toEqual([PROFILE_ID, 'a1'])
    expect(defaultPicked([{ id: 'u1', origin: 'UPLOAD' }])).toEqual([PROFILE_ID])
    expect(defaultPicked([])).toEqual([PROFILE_ID])
  })

  it('leaves the profile out of the picks and the count until it has loaded', () => {
    const sources = [{ id: 'u1', origin: 'UPLOAD' }]
    expect(effectivePicks(null, sources, false)).toEqual([])
    expect(effectivePicks([PROFILE_ID, 'u1'], sources, false)).toEqual(['u1'])
    expect(effectivePicks(null, sources, true)).toEqual([PROFILE_ID])
  })

  it('toggles a row without touching the others', () => {
    expect(togglePick(['a', 'b'], 'b')).toEqual(['a'])
    expect(togglePick(['a'], 'b')).toEqual(['a', 'b'])
    expect(togglePick([], 'a')).toEqual(['a'])
  })

  it('writes the day in Seoul time, today as 오늘', () => {
    expect(seoulWhen('2026-11-05T01:00:00.000Z', now)).toBe('오늘')
    expect(seoulWhen('2026-10-02T01:00:00.000Z', now)).toBe('10월 2일')
    expect(seoulWhen('2026-11-04T16:00:00.000Z', now)).toBe('오늘')
  })

  it('builds the row sub lines and skips what the API leaves out', () => {
    const created = { createdAt: '2026-10-20T01:00:00.000Z', pageCount: null }
    expect(pushDocSub({ ...created, company: '모아페이', postingTitle: '백엔드', pageCount: null }, now)).toBe('모아페이 · 백엔드 · 10월 20일')
    expect(pushDocSub(created, now)).toBe('10월 20일')
    expect(uploadSub({ createdAt: '2026-08-03T01:00:00.000Z', pageCount: 14 }, now)).toBe('8월 3일 · 14쪽')
    expect(uploadSub({ createdAt: null, pageCount: null }, now)).toBe('')
    expect(profileSub('개발 · 4년차', 2, 7)).toBe('개발 · 4년차 · 경력 2개 · 기술 7개')
  })

  it('shows the file type and the posting pair', () => {
    expect(fileBadge('이력서.final.pdf')).toBe('PDF')
    expect(applyPair('모아페이', '백엔드')).toBe('모아페이 · 백엔드')
    expect(applyPair(null, '백엔드')).toBe('백엔드')
    expect(applyPair(undefined, undefined)).toBe('')
  })
})
