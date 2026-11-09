import { useState, type FormEvent } from 'react'

import { OFFER_MESSAGE, OFFER_MESSAGE_PLACEHOLDER, OFFER_SEND, SEND_ICON_PATH } from './constants'

type OfferComposerProps = { sending: boolean; onSend: (body: string) => Promise<unknown> }

const OfferComposer = ({ sending, onSend }: OfferComposerProps) => {
  const [draft, setDraft] = useState('')
  const body = draft.trim()
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!body || sending) return
    try {
      await onSend(body)
      setDraft('')
    } catch {
      return
    }
  }
  return (
    <form className="inbox-composer" onSubmit={submit}>
      <input className="b1" aria-label={OFFER_MESSAGE} placeholder={OFFER_MESSAGE_PLACEHOLDER} value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button type="submit" className="hbtn send" aria-label={OFFER_SEND} disabled={!body || sending}>
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={SEND_ICON_PATH} />
        </svg>
      </button>
    </form>
  )
}

export default OfferComposer
