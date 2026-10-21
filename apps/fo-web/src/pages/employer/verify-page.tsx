import { ApiError, type Company } from '@push/api-client'
import { useState, type FormEvent } from 'react'
import { api } from '../../api'
import { sessionStore } from '../../shared/auth/session'
import {
  BNO_DIGITS,
  COMPANY_EXISTS_COPY,
  LABEL_BNM,
  LABEL_BNO,
  LABEL_PNM,
  LABEL_START,
  START_DT_DIGITS,
  VERIFY_LEAD,
  VERIFY_MISMATCH,
  VERIFY_MISMATCH_DETAIL,
  VERIFY_NAME_HINT,
  VERIFY_PENDING,
  VERIFY_RETRY,
  VERIFY_STATUS_NOTE,
  VERIFY_SUBMIT,
  VERIFY_TITLE,
} from './constants'
import { digitsOf, formatBno, formatStartDt } from './verify-input'
import VerifyDone from './verify-done'
import VerifyField from './verify-field'
import VerifySteps from './verify-steps'

const VerifyPage = () => {
  const [bNo, setBNo] = useState('')
  const [pNm, setPNm] = useState('')
  const [startDt, setStartDt] = useState('')
  const [bNm, setBNm] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<Company | null>(null)
  const bNoDigits = digitsOf(bNo)
  const startDigits = digitsOf(startDt)
  const ready =
    bNoDigits.length === BNO_DIGITS &&
    startDigits.length === START_DT_DIGITS &&
    pNm.trim().length > 0 &&
    bNm.trim().length > 0
  const mismatch = error === VERIFY_RETRY

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready || pending) return
    setError(null)
    setPending(true)
    try {
      const company = await api.companies.verify({
        bNo: bNoDigits,
        startDt: startDigits,
        pNm: pNm.trim(),
        bNm: bNm.trim(),
      })
      const me = await api.auth.me()
      const current = sessionStore.load()
      if (current) {
        sessionStore.save({
          ...current,
          user: { ...current.user, companyId: me.companyId, companyRole: me.companyRole },
        })
      }
      setDone(company)
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'COMPANY_EXISTS') {
        setError(COMPANY_EXISTS_COPY)
        return
      }
      setError(VERIFY_RETRY)
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <main className="auth-card wide">
        <VerifySteps current={3} />
        <VerifyDone company={done} />
      </main>
    )
  }

  return (
    <main className="auth-card wide">
      <VerifySteps current={2} />
      <header className="auth-lead">
        <h1>{VERIFY_TITLE}</h1>
        <p>{VERIFY_LEAD}</p>
      </header>
      {mismatch ? (
        <div className="auth-alert" role="alert">
          <strong>{VERIFY_MISMATCH}</strong>
          <p>
            {VERIFY_MISMATCH_DETAIL} {VERIFY_RETRY}
          </p>
        </div>
      ) : null}
      {error && !mismatch ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <form className="auth-stack" onSubmit={(event) => void submit(event)}>
        <VerifyField label={LABEL_BNM} hint={VERIFY_NAME_HINT} value={bNm} onChange={setBNm} />
        <VerifyField
          label={LABEL_BNO}
          value={formatBno(bNo)}
          inputMode="numeric"
          autoComplete="off"
          invalid={error === COMPANY_EXISTS_COPY}
          onChange={setBNo}
        />
        <VerifyField label={LABEL_PNM} value={pNm} autoComplete="name" invalid={mismatch} onChange={setPNm} />
        <VerifyField
          label={LABEL_START}
          value={formatStartDt(startDt)}
          inputMode="numeric"
          autoComplete="off"
          invalid={mismatch}
          onChange={setStartDt}
        />
        <p className="auth-status-note">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          </svg>
          <span>{VERIFY_STATUS_NOTE}</span>
        </p>
        <button type="submit" className={ready ? 'auth-btn pri' : 'auth-btn pri dis'} disabled={!ready || pending}>
          {pending ? (
            <>
              <span className="auth-spin" aria-hidden="true" />
              {VERIFY_PENDING}
            </>
          ) : (
            VERIFY_SUBMIT
          )}
        </button>
      </form>
    </main>
  )
}

export default VerifyPage
