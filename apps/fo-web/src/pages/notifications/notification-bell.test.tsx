import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { NotificationPanel } from './notification-bell'

const query = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock('../../entities/notification', () => ({ useNotifications: () => query.current }))
vi.mock('./use-notice-actions', () => ({ useNoticeActions: () => ({ read: { isPending: false, mutate: () => undefined }, open: () => undefined }) }))

const render = (next: Record<string, unknown>) => {
  query.current = { isLoading: false, isError: false, isSuccess: false, refetch: () => undefined, ...next }
  return renderToStaticMarkup(<NotificationPanel onClose={() => undefined} />)
}

describe('NotificationPanel states', () => {
  it('shows a skeleton while loading, not the empty state', () => {
    const html = render({ isLoading: true })
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('받은 알림이 없어요')
  })

  it('shows an error with 다시 시도 when the list fails', () => {
    const html = render({ isError: true })
    expect(html).toContain('알림을 불러오지 못했어요.')
    expect(html).toContain('다시 시도')
  })

  it('shows the empty state after an empty answer', () => {
    expect(render({ isSuccess: true, data: { data: [] } })).toContain('받은 알림이 없어요')
  })
})
