import { isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  RouterProvider,
  StaticRouterProvider,
  createMemoryRouter,
  createStaticHandler,
  createStaticRouter,
} from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { isWebView } from '../shared/lib/bridge'
import { ErrorScreen, RouteError } from './route-error'
import { ScrollRoot, appRoutes } from './router'

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  ScrollRestoration: () => <i data-scroll-restoration="" />,
}))

vi.mock('../shared/lib/bridge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../shared/lib/bridge')>()),
  isWebView: vi.fn(() => false),
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

describe('route errors', () => {
  // SSR cannot catch render-time throws, so the route fails in its loader; the errorElement path is the same.
  const render = async (webView: boolean) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(isWebView).mockReturnValue(webView)
    const routes = [
      {
        element: <ScrollRoot />,
        errorElement: <RouteError />,
        children: [
          {
            path: '/',
            element: <p>page</p>,
            loader: () => {
              throw new Error('secret-internal-message')
            },
          },
        ],
      },
    ]
    const handler = createStaticHandler(routes)
    const context = await handler.query(new Request('http://localhost/'))
    if (context instanceof Response) throw new Error('unexpected response')
    return renderToStaticMarkup(
      <StaticRouterProvider
        router={createStaticRouter(handler.dataRoutes, context)}
        context={context}
        hydrate={false}
      />,
    )
  }

  it.each([false, true])(
    'shows Korean copy without the error details (webView %s)',
    async (webView) => {
      const markup = await render(webView)
      expect(markup).toContain('페이지를 불러오지 못했어요')
      expect(markup).toContain('다시 시도')
      expect(markup).not.toMatch(/secret-internal-message|Unexpected Application Error|at Boom/)
      expect(markup.includes('홈으로 가기')).toBe(!webView)
    },
  )

  it('wires errorElement on the root route and 404 on the WebView branch', () => {
    for (const webView of [false, true]) {
      const [root] = appRoutes(webView)
      expect(root?.errorElement).toBeTruthy()
    }
    const paths = appRoutes(true)[0]?.children?.map((r) => r.path)
    expect(paths).toContain('*')
  })

  it('retry button runs onRetry', () => {
    const onRetry = vi.fn()
    const buttons: Array<{ props: { onClick: () => void } }> = []
    const walk = (node: unknown) => {
      if (!isValidElement(node)) return
      const { props } = node as { props: { children?: unknown } }
      if (node.type === 'button') buttons.push(node as never)
      ;[props.children].flat(Infinity).forEach(walk)
    }
    walk(ErrorScreen({ onRetry }))
    expect(buttons).toHaveLength(1)
    buttons[0]?.props.onClick()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
