import { ApiError } from '@push/api-client'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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
  VERIFY_PENDING,
  VERIFY_RETRY,
  VERIFY_SUBMIT,
  VERIFY_TITLE,
} from './constants'

const digitsOf = (value: string) => value.replace(/\D/g, '')

const VerifyPage = () => {
  const navigate = useNavigate()
  const [bNo, setBNo] = useState('')
  const [pNm, setPNm] = useState('')
  const [startDt, setStartDt] = useState('')
  const [bNm, setBNm] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bNoDigits = digitsOf(bNo)
  const startDigits = digitsOf(startDt)
  const ready =
    bNoDigits.length === BNO_DIGITS &&
    startDigits.length === START_DT_DIGITS &&
    pNm.trim().length > 0 &&
    bNm.trim().length > 0

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready || pending) return
    setError(null)
    setPending(true)
    try {
      await api.companies.verify({ bNo: bNoDigits, startDt: startDigits, pNm: pNm.trim(), bNm: bNm.trim() })
      const me = await api.auth.me()
      const current = sessionStore.load()
      if (current) {
        sessionStore.save({
          ...current,
          user: { ...current.user, companyId: me.companyId, companyRole: me.companyRole },
        })
      }
      navigate('/')
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

  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{VERIFY_TITLE}</h1>
      </header>
      <form className="stack form" onSubmit={(event) => void submit(event)}>
        <label className="field">
          <span>{LABEL_BNO}</span>
          <input inputMode="numeric" autoComplete="off" value={bNo} onChange={(event) => setBNo(event.target.value)} />
        </label>
        <label className="field">
          <span>{LABEL_PNM}</span>
          <input autoComplete="name" value={pNm} onChange={(event) => setPNm(event.target.value)} />
        </label>
        <label className="field">
          <span>{LABEL_START}</span>
          <input inputMode="numeric" autoComplete="off" value={startDt} onChange={(event) => setStartDt(event.target.value)} />
        </label>
        <label className="field">
          <span>{LABEL_BNM}</span>
          <input value={bNm} onChange={(event) => setBNm(event.target.value)} />
        </label>
        {pending ? (
          <p className="b2" role="status">
            {VERIFY_PENDING}
          </p>
        ) : null}
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="primary" disabled={!ready || pending}>
          {VERIFY_SUBMIT}
        </button>
      </form>
    </main>
  )
}

export default VerifyPage
