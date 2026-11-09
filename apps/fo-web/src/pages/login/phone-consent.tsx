import type { Session } from '@push/api-client'
import { LEGAL_VERSION } from '@push/shared'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { meUpdateTerms } from '../../features/sign-up'
import { Icon } from '../../shared/ui/icon'
import AuthCheck from './auth-check'
import {
  CONSENT_ALL,
  CONSENT_LEAD,
  CONSENT_SUBMIT,
  CONSENT_TITLE,
  LEGAL_PLACEHOLDER,
  LOGIN_FAILED_COPY,
  OPTIONAL_TAG,
  REQUIRED_TAG,
  TERMS_AGE,
  TERMS_MARKETING,
  TERMS_PRIVACY_POLICY,
  TERMS_PRIVACY,
  TERMS_SERVICE,
  TERMS_VIEW,
} from './constants'

type TermKey = 'age14' | 'serviceTerms' | 'privacy' | 'marketing'
type Terms = Record<TermKey, boolean>

const ROWS: { key: TermKey; label: string; required: boolean; view?: string; detail?: string }[] = [
  { key: 'age14', label: TERMS_AGE, required: true },
  { key: 'serviceTerms', label: TERMS_SERVICE, required: true, view: '/terms' },
  { key: 'privacy', label: TERMS_PRIVACY, required: true, view: '/privacy', detail: LEGAL_PLACEHOLDER },
  { key: 'marketing', label: TERMS_MARKETING, required: false },
]

const NONE: Terms = { age14: false, serviceTerms: false, privacy: false, marketing: false }

const PhoneConsent = ({ session, onDone }: { session: Session; onDone: (session: Session) => void }) => {
  const [terms, setTerms] = useState<Terms>(NONE)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus(), [])
  const all = ROWS.every((row) => terms[row.key])
  const ready = ROWS.every((row) => !row.required || terms[row.key])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready || pending) return
    setFailed(false)
    setPending(true)
    try {
      await meUpdateTerms(
        { age14: true, serviceTerms: true, privacy: true, marketing: terms.marketing, termsVersion: LEGAL_VERSION },
        session.accessToken,
      )
      onDone(session)
    } catch {
      setFailed(true)
      setPending(false)
    }
  }

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1 ref={title} tabIndex={-1}>
          {CONSENT_TITLE}
        </h1>
        <p>{CONSENT_LEAD}</p>
      </header>
      <form className="auth-stack" onSubmit={(event) => void submit(event)}>
        <div className="auth-consents plain">
          <AuthCheck
            checked={all}
            onChange={(checked) => setTerms({ age14: checked, serviceTerms: checked, privacy: checked, marketing: checked })}
          >
            <span className="auth-all">{CONSENT_ALL}</span>
          </AuthCheck>
          <span className="auth-rule" />
          {ROWS.map((row) => (
            <div key={row.key} className="auth-term">
              <AuthCheck checked={terms[row.key]} onChange={(checked) => setTerms((current) => ({ ...current, [row.key]: checked }))}>
                <span className="auth-term-copy">
                  <span className="auth-term-title">
                    <span className={row.required ? 'auth-term-req' : 'auth-term-opt'}>{row.required ? REQUIRED_TAG : OPTIONAL_TAG}</span>{' '}
                    {row.label}
                  </span>
                  {row.detail ? <span className="auth-check-detail">{row.detail}</span> : null}
                </span>
              </AuthCheck>
              {row.view ? (
                <a className="auth-term-view" href={row.view} target="_blank" rel="noreferrer">
                  {TERMS_VIEW}
                  <Icon name="next" size={16} />
                </a>
              ) : null}
            </div>
          ))}
        </div>
        <a className="auth-policy" href="/privacy" target="_blank" rel="noreferrer">
          {TERMS_PRIVACY_POLICY}
        </a>
        {failed ? (
          <p className="auth-error" role="alert">
            {LOGIN_FAILED_COPY}
          </p>
        ) : null}
        <button type="submit" className={ready ? 'auth-btn pri' : 'auth-btn pri dis'} disabled={!ready || pending}>
          {CONSENT_SUBMIT}
        </button>
      </form>
    </main>
  )
}

export default PhoneConsent
