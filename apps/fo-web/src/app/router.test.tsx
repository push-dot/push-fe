import { isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ScrollRoot, appRoutes } from './router'

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  ScrollRestoration: () => <i data-scroll-restoration="" />,
}))

describe('scroll restoration', () => {
  it.each([false, true])('wraps every route in ScrollRoot (webView %s)', (webView) => {
    const routes = appRoutes(webView)
    expect(routes).toHaveLength(1)
    const root = routes[0]?.element
    expect(isValidElement(root) && root.type).toBe(ScrollRoot)
  })

  it('ScrollRoot restores scroll and renders the page', () => {
    const router = createMemoryRouter([
      { element: <ScrollRoot />, children: [{ path: '/', element: <p>page</p> }] },
    ])
    const markup = renderToStaticMarkup(<RouterProvider router={router} />)
    expect(markup).toContain('<i data-scroll-restoration="">')
    expect(markup).toContain('<p>page</p>')
  })
})
