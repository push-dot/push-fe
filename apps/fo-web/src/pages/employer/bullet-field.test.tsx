import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import BulletField from './bullet-field'

describe('BulletField', () => {
  it('names the textarea for screen readers', () => {
    expect(renderToStaticMarkup(<BulletField label="하는 일" value="" onChange={() => undefined} />)).toContain('aria-label="하는 일"')
  })
})
