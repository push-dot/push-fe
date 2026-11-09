import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { onFirstScroll } from './first-scroll'
import JobsPage from './jobs-page'

const list = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock('../../entities/posting', () => ({
  usePostingPages: () => list.current,
  usePostingCount: () => ({}),
  usePostingLocations: () => ({}),
}))

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <JobsPage />
    </MemoryRouter>,
  )

describe('JobsPage states', () => {
  beforeEach(() => {
    list.current = { isLoading: false, isError: false, isSuccess: false, data: undefined, hasNextPage: false }
  })

  it('shows an error with 다시 시도, not the empty state, when the list fails', () => {
    list.current = { ...list.current, isError: true }
    const html = render()
    expect(html).toContain('공고를 불러오지 못했어요')
    expect(html).toContain('다시 시도')
    expect(html).not.toContain('조건에 맞는')
    expect(html).not.toContain('공고 0개')
  })

  it('shows the empty state only after an empty answer', () => {
    list.current = { ...list.current, isSuccess: true, data: { pages: [{ data: [], page: { total: 0 } }] } }
    const html = render()
    expect(html).toContain('공고 0개')
    expect(html).not.toContain('공고를 불러오지 못했어요')
  })
})

describe('onFirstScroll', () => {
  it('stops listening once cleaned up', () => {
    const target = new EventTarget()
    const done = vi.fn()
    onFirstScroll(target, done)()
    target.dispatchEvent(new Event('scroll'))
    expect(done).not.toHaveBeenCalled()
  })

  it('fires once on the first scroll', () => {
    const target = new EventTarget()
    const done = vi.fn()
    onFirstScroll(target, done)
    target.dispatchEvent(new Event('scroll'))
    target.dispatchEvent(new Event('scroll'))
    expect(done).toHaveBeenCalledTimes(1)
  })
})
