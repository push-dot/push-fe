import { describe, expect, it, vi } from 'vitest'
import { PUSH_DOC_SUPPORT, pushDocMenu, type PushDocAction } from './push-doc-menu'

const on = (): Record<PushDocAction, () => void> => ({ posting: vi.fn(), export: vi.fn(), rename: vi.fn(), duplicate: vi.fn(), delete: vi.fn() })
const labels = (s: ReturnType<typeof pushDocMenu>) => s.map((g) => g.actions.map((a) => a.label))

describe('pushDocMenu', () => {
  it('lists the board items in two groups for a doc with a posting, hiding what push-be cannot do', () => {
    expect(labels(pushDocMenu({ hasPosting: true }, on()))).toEqual([['공고 보기', 'PDF로 내보내기', '이름 바꾸기'], ['삭제하기']])
  })

  it('hides 공고 보기 for a doc without a posting', () => {
    expect(labels(pushDocMenu({ hasPosting: false }, on()))).toEqual([['PDF로 내보내기', '이름 바꾸기'], ['삭제하기']])
  })

  it('shows 복제하기 once duplicate is supported', () => {
    expect(labels(pushDocMenu({ hasPosting: false }, on(), { ...PUSH_DOC_SUPPORT, duplicate: true }))[0]).toContain('복제하기')
  })

  it('marks only 삭제하기 destructive and runs the handler of the tapped item', () => {
    const h = on()
    const actions = pushDocMenu({ hasPosting: true }, h).flatMap((g) => g.actions)
    expect(actions.filter((a) => a.destructive).map((a) => a.label)).toEqual(['삭제하기'])
    actions.find((a) => a.key === 'rename')!.onPress()
    expect(h.rename).toHaveBeenCalledOnce()
    expect(h.delete).not.toHaveBeenCalled()
  })

  it('drops a group left empty so no lone divider shows', () => {
    expect(labels(pushDocMenu({ hasPosting: true }, on(), { ...PUSH_DOC_SUPPORT, delete: false }))).toEqual([['공고 보기', 'PDF로 내보내기', '이름 바꾸기']])
  })
})
