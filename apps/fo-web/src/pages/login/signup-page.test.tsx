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

  it('asks for consent to collection and use, which is what the checkbox records', () => {
    const html = employerForm()
    expect(html).toContain('만 14세 이상이며 이용약관과 개인정보 수집·이용에 동의해요')
    expect(html).not.toContain('개인정보 처리방침에 동의해요')
  })
})
