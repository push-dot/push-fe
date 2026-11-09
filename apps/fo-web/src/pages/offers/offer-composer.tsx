import { useState, type FormEvent } from 'react'

import { Icon } from '../../shared/ui/icon'
import { OFFER_MESSAGE, OFFER_MESSAGE_PLACEHOLDER, OFFER_SEND } from './constants'

type OfferComposerProps = { sending: boolean; onSend: (body: string) => Promise<unknown> }

const OfferComposer = ({ sending, onSend }: OfferComposerProps) => {
  const [draft, setDraft] = useState('')
  const body = draft.trim()
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!body || sending) return
    onSend(body).then(
      () => setDraft(''),
      () => undefined,
    )
  }
  return (
    <form className="msg-composer" onSubmit={submit}>
      <input className="b1" aria-label={OFFER_MESSAGE} placeholder={OFFER_MESSAGE_PLACEHOLDER} value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button type="submit" className="hbtn msg-send" aria-label={OFFER_SEND} disabled={!body || sending}>
        <Icon name="up" size={20} width={2.4} />
      </button>
    </form>
  )
}

export default OfferComposer
