import type { Career } from '@push/api-client'
import { useState } from 'react'
import { Dialog } from '../../shared/ui/dialog'
import {
  CANCEL_LABEL,
  CAREER_ADD,
  CAREER_DONE,
  CAREER_EDIT,
  CAREER_FIELDS,
  DELETE_LABEL,
} from './constants'

type CareerDialogProps = {
  career: Career | null
  onSave: (career: Career) => void
  onRemove?: () => void
  onClose: () => void
}

const month = (iso: string | null) => (iso ? iso.slice(0, 7) : '')

const CareerDialog = ({ career, onSave, onRemove, onClose }: CareerDialogProps) => {
  const [draft, setDraft] = useState({
    company: career?.company ?? '',
    role: career?.role ?? '',
    start: month(career?.startedOn ?? null),
    end: month(career?.endedOn ?? null),
    description: career?.description ?? '',
  })
  const title = career ? CAREER_EDIT : CAREER_ADD
  const ready = draft.company.trim() && draft.role.trim() && draft.start
  const set = (key: keyof typeof draft) => (event: { target: { value: string } }) =>
    setDraft({ ...draft, [key]: event.target.value })
  return (
    <Dialog label={title} onClose={onClose} className="confirm">
      <h2 className="h3">{title}</h2>
      <form
        id="career-edit"
        className="mp-career-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready) return
          onSave({
            company: draft.company.trim(),
            role: draft.role.trim(),
            startedOn: `${draft.start}-01`,
            endedOn: draft.end ? `${draft.end}-01` : null,
            description: draft.description.trim(),
          })
        }}
      >
        <label className="field">
          {CAREER_FIELDS.company}
          <input autoFocus value={draft.company} onChange={set('company')} />
        </label>
        <label className="field">
          {CAREER_FIELDS.role}
          <input value={draft.role} onChange={set('role')} />
        </label>
        <div className="mp-grid">
          <label className="field">
            {CAREER_FIELDS.start}
            <input type="month" value={draft.start} onChange={set('start')} />
          </label>
          <label className="field">
            {CAREER_FIELDS.end}
            <input
              type="month"
              value={draft.end}
              min={draft.start || undefined}
              onChange={set('end')}
            />
          </label>
        </div>
        <p className="c1 t3">{CAREER_FIELDS.endHint}</p>
        <label className="field">
          {CAREER_FIELDS.description}
          <input value={draft.description} onChange={set('description')} />
        </label>
      </form>
      <div className="sheet-actions">
        {onRemove ? (
          <button type="button" className="btn sec mp-remove" onClick={onRemove}>
            {DELETE_LABEL}
          </button>
        ) : null}
        <button type="button" className="btn sec" onClick={onClose}>
          {CANCEL_LABEL}
        </button>
        <button type="submit" form="career-edit" className="btn pri" disabled={!ready}>
          {CAREER_DONE}
        </button>
      </div>
    </Dialog>
  )
}

export default CareerDialog
