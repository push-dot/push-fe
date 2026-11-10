import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import SignupPage from './signup-page'

const employerForm = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/signup?accountType=EMPLOYER']}>
      <SignupPage />
    </MemoryRouter>,
  )

describe('employer sign-up consent', () => {
  it('links the terms and the privacy policy in a new tab, so the filled form stays', () => {
    const html = employerForm()
    expect(html).toMatch(/<a[^>]*href="\/terms"[^>]*target="_blank"/)
    expect(html).toMatch(/<a[^>]*href="\/privacy-consent"[^>]*target="_blank"/)
    expect(html).toContain('개인정보 수집·이용 보기')
    expect(html).toMatch(/<a[^>]*href="\/privacy"[^>]*target="_blank"/)
  })

  it('has no placeholder copy left', () => {
    expect(employerForm()).not.toContain('[자리 표시]')
  })
})
