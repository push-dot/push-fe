import type { Session } from '@push/api-client'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

import { authPhoneSend, authPhoneVerify } from '../../features/sign-in'
import type { OAuthProvider } from '../../shared/model/login-providers'
import { Icon } from '../../shared/ui/icon'
import AuthAlert from './auth-alert'
import AuthBack from './auth-back'
import { ProviderMark } from './auth-provider-button'
import {
  CODE_CHANGE,
  CODE_COOLDOWN_TAIL,
  CODE_EXPIRED,
  CODE_LEAD_TAIL,
  CODE_LIMIT_DETAIL,
  CODE_PLACEHOLDER,
  CODE_RESEND,
  CODE_SEND_LATER,
  CODE_SUBMIT,
  CODE_TITLE,
  CODE_WRONG,
  LOGIN_FAILED_COPY,
  PHONE_LABEL,
  PHONE_LEAD,
  PHONE_OTHER,
  PHONE_SEND,
  PHONE_TAKEN_HEAD,
  PHONE_TAKEN_OTHER,
  PHONE_TAKEN_TAIL,
  PHONE_TAKEN_TITLE,
  PHONE_TITLE,
  PROVIDER_NAME,
  codeLimitTitle,
  providerLogin,
} from './constants'
import { clockOf, codeDigits, formatPhone, phoneFailure, sendCooldown, toE164, validPhone, type PhoneFailure } from './phone'
import PhoneConsent from './phone-consent'
import { termsPending } from './terms-gate'

type CodeState = Extract<PhoneFailure, { kind: 'wrong' | 'expired' | 'limit' }> | null

const PhoneFlow = ({
  pendingToken,
  backLabel,
  onBack,
  onProvider,
  onDone,
}: {
  pendingToken?: string
  backLabel?: string
  onBack?: () => void
  onProvider: (provider: OAuthProvider) => void
  onDone: (session: Session) => void
}) => {
  const [step, setStep] = useState<'number' | 'code'>('number')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [codeState, setCodeState] = useState<CodeState>(null)
  const [taken, setTaken] = useState<{ provider: OAuthProvider | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [consent, setConsent] = useState<Session | null>(null)
  // The wait shows in the resend states (board: none) only after push-be refused a resend.
  const [refused, setRefused] = useState(false)
  const phoneInput = useRef<HTMLInputElement>(null)
  const codeInput = useRef<HTMLInputElement>(null)
  const firstStep = useRef(true)
  const errorId = useId()
  const codeErrorId = useId()

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false
      return
    }
    ;(step === 'code' ? codeInput : phoneInput).current?.focus()
  }, [step])

  const waiting = resendAt - now
  useEffect(() => {
    if (step !== 'code' || waiting <= 0) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [step, waiting > 0])

  const send = async () => {
    setError(null)
    setPending(true)
    try {
      const sent = await authPhoneSend(toE164(phone))
      setResendAt(Date.now() + sent.cooldownSeconds * 1000)
      setNow(Date.now())
      setCode('')
      setCodeState(null)
      setRefused(false)
      setStep('code')
    } catch (caught) {
      const wait = sendCooldown(caught)
      if (wait === null) {
        setError((caught as { code?: string } | null)?.code === 'RATE_LIMITED' ? CODE_SEND_LATER : LOGIN_FAILED_COPY)
        return
      }
      // A code went to this number moments ago: go (back) to the code step so it can still be entered, like the app.
      setResendAt(Date.now() + wait * 1000)
      setNow(Date.now())
      setRefused(true)
      if (step === 'number') {
        setCode('')
        setCodeState(null)
        setStep('code')
      }
    } finally {
      setPending(false)
    }
  }

  const verify = async () => {
    setError(null)
    setPending(true)
    try {
      const result = await authPhoneVerify({ phone: toE164(phone), code, ...(pendingToken ? { pendingToken } : {}) })
      const { created: _created, linked: _linked, provider: _provider, ...session } = result
      if (await termsPending(session)) setConsent(session)
      else onDone(session)
    } catch (caught) {
      const failure = phoneFailure(caught)
      if (failure.kind === 'taken') {
        // push-be sends the code to any number and refuses only here, so the board's number-step card shows after the code step.
        setTaken({ provider: failure.provider })
        setStep('number')
      } else if (failure.kind === 'failed') {
        setError(LOGIN_FAILED_COPY)
      } else {
        if (failure.kind === 'limit') setCode('')
        setCodeState(failure)
      }
    } finally {
      setPending(false)
    }
  }

  if (consent) return <PhoneConsent session={consent} onDone={onDone} />

  if (step === 'number') {
    const submitNumber = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (validPhone(phone) && !pending && !taken) void send()
    }
    return (
      <main className="auth-card">
        <header className="auth-lead">
          <h1>{PHONE_TITLE}</h1>
          <p>{PHONE_LEAD}</p>
        </header>
        <form className="auth-stack" onSubmit={submitNumber}>
          <span className="auth-control">
            <input
              ref={phoneInput}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              placeholder="010-0000-0000"
              aria-label={PHONE_LABEL}
              aria-describedby={error ? errorId : undefined}
              readOnly={Boolean(taken)}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
            />
          </span>
          {error ? (
            <p id={errorId} className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          {taken ? (
            <div className="auth-taken" role="alert">
              <div className="auth-taken-head">
                <span className="auth-taken-mark" aria-hidden="true">
                  <Icon name="user" size={20} width={1.8} />
                </span>
                <span className="auth-taken-copy">
                  <strong>{PHONE_TAKEN_TITLE}</strong>
                  <span>
                    {taken.provider ? `${PHONE_TAKEN_HEAD}${PROVIDER_NAME[taken.provider]}${PHONE_TAKEN_TAIL}` : PHONE_TAKEN_OTHER}
                  </span>
                </span>
              </div>
              <div className="auth-stack tight">
                {taken.provider ? (
                  <button type="button" className="auth-btn line" onClick={() => taken.provider && onProvider(taken.provider)}>
                    <ProviderMark provider={taken.provider} />
                    {providerLogin(PROVIDER_NAME[taken.provider])}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="auth-btn sec"
                  onClick={() => {
                    setTaken(null)
                    setPhone('')
                    phoneInput.current?.focus()
                  }}
                >
                  {PHONE_OTHER}
                </button>
              </div>
            </div>
          ) : (
            <button type="submit" className={validPhone(phone) ? 'auth-btn pri' : 'auth-btn pri dis'} disabled={pending}>
              {PHONE_SEND}
            </button>
          )}
        </form>
      </main>
    )
  }

  const again = codeState?.kind === 'expired' || codeState?.kind === 'limit'
  const submitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    if (again) void send()
    else if (code.length === 6) void verify()
  }
  const codeError = codeState?.kind === 'wrong' ? CODE_WRONG : codeState?.kind === 'expired' ? CODE_EXPIRED : null
  const controlClass = ['auth-control', codeError ? 'err' : '', codeState?.kind === 'limit' ? 'dim' : ''].filter(Boolean).join(' ')
  return (
    <main className="auth-card">
      {backLabel && onBack ? <AuthBack label={backLabel} onClick={onBack} /> : null}
      <header className="auth-lead">
        <h1>{CODE_TITLE}</h1>
        <p>
          <b>{phone}</b>
          {CODE_LEAD_TAIL}
        </p>
      </header>
      {codeState?.kind === 'limit' ? <AuthAlert title={codeLimitTitle(codeState.maxAttempts)} detail={CODE_LIMIT_DETAIL} /> : null}
      <form className="auth-stack" onSubmit={submitCode}>
        <div className="auth-block">
          <span className={controlClass}>
            <input
              ref={codeInput}
              className="auth-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              placeholder={CODE_PLACEHOLDER}
              aria-label={CODE_PLACEHOLDER}
              aria-invalid={codeError ? true : undefined}
              aria-describedby={[codeError ? codeErrorId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
              disabled={codeState?.kind === 'limit'}
              onChange={(event) => {
                setCode(codeDigits(event.target.value))
                if (codeState?.kind === 'wrong') setCodeState(null)
              }}
            />
            {codeState?.kind === 'expired' ? <span className="auth-clock">{clockOf(0)}</span> : null}
          </span>
          {codeError ? (
            <span id={codeErrorId} className="auth-error" role="alert">
              {codeError}
            </span>
          ) : null}
          {error ? (
            <span id={errorId} className="auth-error" role="alert">
              {error}
            </span>
          ) : null}
          <div className="auth-code-row">
            {waiting > 0 ? (
              <span>{!again || refused ? `${clockOf(waiting)}${CODE_COOLDOWN_TAIL}` : ''}</span>
            ) : again ? (
              <span />
            ) : (
              <button type="button" className="auth-link" disabled={pending} onClick={() => void send()}>
                {CODE_RESEND}
              </button>
            )}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setStep('number')
                setCodeState(null)
                setError(null)
              }}
            >
              {CODE_CHANGE}
            </button>
          </div>
        </div>
        <button type="submit" className={again || code.length === 6 ? 'auth-btn pri' : 'auth-btn pri dis'} disabled={pending}>
          {again ? CODE_RESEND : CODE_SUBMIT}
        </button>
      </form>
    </main>
  )
}

export default PhoneFlow
