import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activeToastHost, hideToast, mountSheet, mountToastHost, showToast, sizeSheet, toastDuration, toastOffsets, useToastStore } from '../toast-store'

beforeEach(() => useToastStore.setState({ current: null, hosts: [], sheet: 0 }))

describe('toast store', () => {
  it('shows the newest toast in place of the current one', () => {
    showToast({ message: '저장했어요' })
    const first = useToastStore.getState().current!.id
    showToast({ message: '링크를 지웠어요' })
    expect(useToastStore.getState().current).toMatchObject({ message: '링크를 지웠어요' })
    expect(useToastStore.getState().current!.id).not.toBe(first)
  })

  it('ignores a hide for a toast that was already replaced', () => {
    showToast({ message: 'a' })
    const stale = useToastStore.getState().current!.id
    showToast({ message: 'b' })
    hideToast(stale)
    expect(useToastStore.getState().current).toMatchObject({ message: 'b' })
    hideToast(useToastStore.getState().current!.id)
    expect(useToastStore.getState().current).toBeNull()
  })

  it('clears the toast when a sheet opens and keeps its height until it closes', () => {
    showToast({ message: '서류를 삭제했어요' })
    const close = mountSheet()
    expect(useToastStore.getState().current).toBeNull()
    sizeSheet(240)
    showToast({ message: '삭제하지 못했어요. 다시 시도해 주세요' })
    expect(useToastStore.getState()).toMatchObject({ sheet: 240, current: { message: '삭제하지 못했어요. 다시 시도해 주세요' } })
    close()
    expect(useToastStore.getState().sheet).toBe(0)
  })

  it('keeps an undo toast up longer than a plain one', () => {
    expect(toastDuration({ message: 'a', action: { label: '되돌리기', onPress: vi.fn() } })).toBeGreaterThan(toastDuration({ message: 'a' }))
  })
})

describe('toast hosts', () => {
  it('lets the last mounted host show toasts and hands back on unmount', () => {
    const unmountRoot = mountToastHost('root')
    const unmountSheet = mountToastHost('sheet')
    expect(activeToastHost(useToastStore.getState())).toBe('sheet')
    unmountSheet()
    expect(activeToastHost(useToastStore.getState())).toBe('root')
    unmountRoot()
    expect(activeToastHost(useToastStore.getState())).toBeUndefined()
  })
})

describe('toast offsets', () => {
  it('keep the artboard gaps above the tab bar', () => {
    expect(toastOffsets(60)).toEqual({ tabs: 74, docsCta: 160, docsError: 210, cta: 92 })
    expect(toastOffsets(80)).toEqual({ tabs: 94, docsCta: 180, docsError: 230, cta: 92 })
  })
})
