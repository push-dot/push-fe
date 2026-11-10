import { describe, expect, it, vi } from 'vitest'

import { offerToast } from './offer-toast'

describe('offerToast', () => {
  it('shows failures as the error toast', () => {
    expect(offerToast({ kind: 'failed', message: '잠시 뒤에 다시 시도해 주세요.' })).toEqual({ message: '잠시 뒤에 다시 시도해 주세요.', tone: 'err' })
  })

  it('turns undo into the 되돌리기 action', () => {
    const undo = vi.fn()
    const toast = offerToast({ kind: 'archived', message: '제안을 보관했어요', undo })
    expect(toast.action?.label).toBe('되돌리기')
    toast.action!.onClick()
    expect(undo).toHaveBeenCalled()
  })

  it('keeps the rest plain', () => {
    expect(offerToast({ kind: 'reported', message: '신고가 접수됐어요' })).toEqual({ message: '신고가 접수됐어요' })
  })
})
