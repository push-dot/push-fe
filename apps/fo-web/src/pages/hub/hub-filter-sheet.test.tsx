import { TENURES } from '@push/api-client'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import HubFilterSheet, { profileFilters } from './hub-filter-sheet'

beforeAll(() => {
  vi.stubGlobal('HTMLElement', class HTMLElement {})
  vi.stubGlobal('document', { activeElement: null })
})

describe('hub tenure filter', () => {
  it('shows the five board buckets', () => {
    const html = renderToStaticMarkup(
      <HubFilterSheet
        draft={{}}
        onChange={() => undefined}
        onClose={() => undefined}
        onApply={() => undefined}
      />,
    )
    for (const item of TENURES) expect(html).toContain(item.label)
    expect(TENURES.map((item) => item.key)).toEqual(['0', '1-2', '3-5', '6-9', '10+'])
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(TENURES.length + 3)
  })

  it('sends 신입 and 1–2년 as 0 and 1-2', () => {
    expect(profileFilters([], { tenure: '0' }).tenure).toEqual(['0'])
    expect(profileFilters([], { tenure: '1-2' }).tenure).toEqual(['1-2'])
    expect(profileFilters(['dev'], { tenure: '1-2', status: 'seeking' })).toEqual({
      category: ['dev'],
      tenure: ['1-2'],
      status: ['seeking'],
    })
  })
})
