import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import HubPage from './hub-page'

const list = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock('../../entities/profile', () => ({ useProfilePages: () => list.current }))

const render = (next: Record<string, unknown>) => {
  list.current = { isLoading: false, isError: false, isSuccess: false, hasNextPage: false, refetch: () => undefined, ...next }
  return renderToStaticMarkup(
    <MemoryRouter>
      <HubPage />
    </MemoryRouter>,
  )
}

describe('HubPage states', () => {
  it('shows an error with 다시 시도, not the empty state, when the list fails', () => {
    const html = render({ isError: true })
    expect(html).toContain('프로필을 불러오지 못했어요')
    expect(html).toContain('다시 시도')
    expect(html).not.toContain('조건에 맞는 프로필이 없어요')
  })

  it('shows only the skeleton while loading', () => {
    const html = render({ isLoading: true })
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('조건에 맞는 프로필이 없어요')
  })

  it('shows the empty state after an empty answer', () => {
    expect(render({ isSuccess: true, data: { pages: [{ data: [] }] } })).toContain('조건에 맞는 프로필이 없어요')
  })
})
