import type { Session } from '@push/api-client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import PhoneConsent from './phone-consent'

const session = {
  accessToken: 'at',
  refreshToken: 'rt',
  user: { id: 'u1', accountType: 'PERSONAL' },
} as unknown as Session

const html = () => renderToStaticMarkup(<PhoneConsent session={session} onDone={() => undefined} />)

const viewHref = (markup: string, label: string) => {
  const row = markup.split('class="auth-term"').find((part) => part.includes(label))
  return row?.match(/class="auth-term-view" href="([^"]+)" target="_blank"/)?.[1]
}

describe('sign-up consent screen', () => {
  it('shows no placeholder copy', () => {
    expect(html()).not.toContain('[자리 표시]')
  })

  it('opens the document each row agrees to, in a new tab so the choices stay', () => {
    const markup = html()
    expect(viewHref(markup, '서비스 이용약관')).toBe('/terms')
    expect(viewHref(markup, '개인정보 수집·이용')).toBe('/privacy-consent')
    expect(viewHref(markup, '혜택·이벤트 알림 받기')).toBe('/marketing-consent')
    expect(viewHref(markup, '만 14세 이상이에요')).toBeUndefined()
  })
})
