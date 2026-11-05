import { describe, expect, it } from 'vitest'
import { APPLY_FAILURE, APPLY_PENDING, TAILORED_DOC, keepRadio, kindLine, sourceSub } from './apply-copy'
import { APPLY_CONFIRM } from './constants'

describe('apply sheet', () => {
  it('radio keeps a selection', () => {
    expect(keepRadio('a', 'a')).toBe('a')
    expect(keepRadio('a', 'b')).toBe('b')
    expect(keepRadio(null, 'a')).toBe('a')
  })

  it('pending label', () => {
    expect(APPLY_PENDING).toBe('지원하는 중…')
    expect(APPLY_CONFIRM).toBe('이 서류로 지원하기')
  })

  it('failure label', () => {
    expect(APPLY_FAILURE).toBe('지원하지 못했어요. 잠시 후 다시 눌러 주세요.')
  })

  it('kind line only when kind is set', () => {
    expect(kindLine('포트폴리오')).toBe('포트폴리오')
    expect(kindLine('')).toBeNull()
    expect(kindLine(undefined)).toBeNull()
  })

  it('AI sub uses 오늘 for today', () => {
    const now = new Date('2026-11-05T03:00:00.000Z')
    expect(sourceSub('AI', '2026-11-05T01:00:00.000Z', now)).toBe(`${TAILORED_DOC} · 오늘`)
    expect(sourceSub('AI', '2026-10-02T01:00:00.000Z', now)).toBe(`${TAILORED_DOC} · 10월 2일`)
    expect(sourceSub('AI', null, now)).toBe(TAILORED_DOC)
    expect(sourceSub('UPLOAD', '2026-11-05T01:00:00.000Z', now)).toBe('원본')
  })
})
