import { useState } from 'react'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import {
  CANCEL_LABEL,
  CLOSE_LABEL,
  LINK_ADD,
  LINK_ADD_CONFIRM,
  LINK_FIELD,
  LINK_HINT,
  LINK_KINDS,
} from './constants'
import { guessLinkKind, normalizeUrl } from './my-rules'

type LinkAddDialogProps = { busy: boolean; onAdd: (url: string) => void; onClose: () => void }

const LinkAddDialog = ({ busy, onAdd, onClose }: LinkAddDialogProps) => {
  const [value, setValue] = useState('')
  const url = normalizeUrl(value)
  const kind = url ? LINK_KINDS.find((entry) => entry.key === guessLinkKind(url))?.label : null
  return (
    <Dialog label={LINK_ADD} onClose={onClose}>
      <div className="link-add-head">
        <h2 className="h2">{LINK_ADD}</h2>
        <button
          type="button"
          className="hbtn link-add-close"
          aria-label={CLOSE_LABEL}
          onClick={onClose}
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <form
        id="link-add"
        onSubmit={(event) => {
          event.preventDefault()
          if (url) onAdd(url)
        }}
      >
        <label className="field">
          {LINK_FIELD}
          <span className="link-box">
            <Icon name="link" size={18} className="t3" />
            <input
              autoFocus
              type="url"
              inputMode="url"
              value={value}
              placeholder="https://"
              onChange={(event) => setValue(event.target.value)}
            />
            {kind ? <span className="badge grey">{kind}</span> : null}
          </span>
        </label>
        <p className="c1 t3 link-hint">{LINK_HINT}</p>
      </form>
      <div className="sheet-actions link-add-actions">
        <button type="button" className="btn sec" onClick={onClose}>
          {CANCEL_LABEL}
        </button>
        <button type="submit" form="link-add" className="btn pri" disabled={busy || !url}>
          {LINK_ADD_CONFIRM}
        </button>
      </div>
    </Dialog>
  )
}

export default LinkAddDialog
