import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { VerifyExpired } from './verify-page'

describe('expired verification', () => {
  it('offers 인증 메일 다시 보내기 as a button, not another sign-up form', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <VerifyExpired email="kim@push.app" />
      </MemoryRouter>,
    )
    expect(html).toContain('인증 메일 다시 보내기')
    expect(html).toMatch(/<button[^>]*class="auth-btn pri"[^>]*>인증 메일 다시 보내기<\/button>/)
    expect(html).not.toMatch(/<a[^>]*>인증 메일 다시 보내기<\/a>/)
    expect(html).toContain('kim@push.app')
    expect(html).not.toContain('/signup?accountType=EMPLOYER&amp;email=')
  })
})
