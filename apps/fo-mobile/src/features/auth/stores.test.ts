import { beforeEach, describe, expect, it } from 'vitest'
import { TERMS_TEXT, TERM_ROWS, isTermKey } from './constants'
import { useTermsConsent, usePhoneAuth } from './stores'

describe('usePhoneAuth', () => {
  it('keeps the social provider for the email pill until cleared', () => {
    usePhoneAuth.getState().beginSocial('pending', 'seojun.kim@gmail.com', 'google')
    expect(usePhoneAuth.getState()).toMatchObject({ mode: 'social', email: 'seojun.kim@gmail.com', provider: 'google' })
    usePhoneAuth.getState().beginPhone()
    expect(usePhoneAuth.getState().provider).toBeNull()
  })
})

describe('useTermsConsent', () => {
  beforeEach(() => useTermsConsent.getState().reset())

  it('agreeing to a term checks only that term and keeps it checked', () => {
    useTermsConsent.getState().agree('privacy')
    expect(useTermsConsent.getState().checked).toEqual({ age14: false, serviceTerms: false, privacy: true, marketing: false })
    useTermsConsent.getState().agree('privacy')
    expect(useTermsConsent.getState().checked.privacy).toBe(true)
  })

  it('toggle-all checks everything, then clears it once everything is checked', () => {
    useTermsConsent.getState().toggleAll()
    expect(Object.values(useTermsConsent.getState().checked).every(Boolean)).toBe(true)
    useTermsConsent.getState().toggleAll()
    expect(Object.values(useTermsConsent.getState().checked).some(Boolean)).toBe(false)
  })

  it('every term row with a chevron has its own text, and age14 has none', () => {
    expect(TERM_ROWS.filter((row) => isTermKey(row.id)).map((row) => row.id)).toEqual(['serviceTerms', 'privacy', 'marketing'])
    expect(TERMS_TEXT.serviceTerms.title).toBe('서비스 이용약관')
    expect(TERMS_TEXT.privacy.title).toBe('개인정보 수집·이용')
    expect(TERMS_TEXT.marketing.sections).toHaveLength(6)
  })
})
