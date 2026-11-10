import { ApiError, type Company } from '@push/api-client'
import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'

import { companiesInvite, inviteHint, inviteLimitCopy } from '../../features/invite-member'
import { canInvite } from '../../shared/model/employer-plan'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import {
  INVITE_CANCEL,
  INVITE_DIALOG_TITLE,
  INVITE_EMAIL,
  INVITE_FAILED_SEND,
  INVITE_SUBMIT,
  MEMBERS_CLOSE,
  inviteFullNote,
  inviteLead,
  seatPlan,
} from './constants'

const InviteDialog = ({ company, refresh, onClose, onSent }: { company: Company; refresh: () => Promise<void>; onClose: () => void; onSent: () => void }) => {
  const [email, setEmail] = useState('')
  const [failed, setFailed] = useState(false)
  const open = canInvite(company.plan, company.seats.used)
  const plan = seatPlan(company.plan)
  const note = open ? null : plan ? inviteFullNote(plan) : inviteHint(company.plan, company.seats.used, true)
  const invite = useMutation({
    mutationFn: (next: string) => companiesInvite(next),
    onSuccess: async () => {
      await refresh()
      onSent()
    },
    onError: async (error) => {
      const forbidden = error instanceof ApiError && error.status === 403
      setFailed(!(forbidden && error.code === 'SEAT_LIMIT'))
      // SEAT_LIMIT, or the role moved to someone else: reload what the page may show.
      if (forbidden) await refresh()
    },
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = email.trim()
    if (!next || !open || invite.isPending) return
    invite.mutate(next)
  }
  return (
    <Dialog label={INVITE_DIALOG_TITLE} onClose={onClose} wide>
      <div className="invite-head">
        <span className="invite-title">
          <h2 className="h2">{INVITE_DIALOG_TITLE}</h2>
          <p className="b2 t3">{inviteLead(company.name)}</p>
        </span>
        <button type="button" className="invite-x" aria-label={MEMBERS_CLOSE} onClick={onClose}>
          <Icon name="close" size={18} width={2.2} />
        </button>
      </div>
      <form className="invite-form" onSubmit={submit}>
        <label className="field">
          <span>{INVITE_EMAIL}</span>
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {note ? (
          <p className="seat-note c1 t2">
            <Icon name="warn" size={18} />
            <span>{note}</span>
          </p>
        ) : (
          <p className="c1 t3">{inviteLimitCopy(company.seats.used, company.seats.limit)}</p>
        )}
        {failed ? (
          <p className="auth-error" role="alert">
            {INVITE_FAILED_SEND}
          </p>
        ) : null}
        <div className="sheet-actions">
          <button type="button" className="btn sec" onClick={onClose}>
            {INVITE_CANCEL}
          </button>
          <button type="submit" className="btn pri" disabled={!open || email.trim().length === 0 || invite.isPending}>
            {INVITE_SUBMIT}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

export default InviteDialog
