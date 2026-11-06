import { beforeEach, describe, expect, it, vi } from 'vitest'
import { askConfirm, useConfirmStore } from '../confirm-store'
import { showToast, useToastStore } from '../toast-store'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('expo-router', () => ({ router: { push } }))

describe('askConfirm', () => {
  beforeEach(() => {
    push.mockClear()
    useConfirmStore.getState().set(null)
  })

  it('askConfirm stores the request and pushes /confirm', () => {
    const onConfirm = vi.fn()
    askConfirm({ title: '이 서류를 삭제할까요?', body: '지워요', confirm: '삭제', onConfirm })
    expect(useConfirmStore.getState().request).toMatchObject({ title: '이 서류를 삭제할까요?', confirm: '삭제' })
    expect(push).toHaveBeenCalledWith('/confirm')
  })

  it('askConfirm clears the toast so it cannot cover the confirm sheet', () => {
    showToast({ message: '링크를 삭제했어요', action: { label: '되돌리기', onPress: vi.fn() } })
    askConfirm({ title: '이 링크를 삭제할까요?', body: '지워요', confirm: '삭제', onConfirm: vi.fn() })
    expect(useToastStore.getState().current).toBeNull()
  })

  it('askConfirm pushes the given href', () => {
    askConfirm({ title: '이 경력을 삭제할까요?', body: '지워요', confirm: '삭제', onConfirm: vi.fn() }, '/(app)/(stack)/(tabs)/(my)/confirm')
    expect(push).toHaveBeenCalledWith('/(app)/(stack)/(tabs)/(my)/confirm')
  })

  it('set(null) clears the request', () => {
    askConfirm({ title: '제목', body: '본문', confirm: '확인', onConfirm: vi.fn() })
    useConfirmStore.getState().set(null)
    expect(useConfirmStore.getState().request).toBeNull()
  })
})
