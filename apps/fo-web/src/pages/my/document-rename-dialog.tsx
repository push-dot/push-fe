import { useState } from 'react'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { CANCEL_LABEL, DOCUMENT_RENAME, SAVE_LABEL } from './constants'

type DocumentRenameDialogProps = {
  name: string
  busy: boolean
  onSave: (name: string) => void
  onClose: () => void
}

const DocumentRenameDialog = ({ name, busy, onSave, onClose }: DocumentRenameDialogProps) => {
  const [value, setValue] = useState(name)
  const next = value.trim()
  return (
    <Dialog label={DOCUMENT_RENAME.title} onClose={onClose} className="confirm">
      <div className="confirm-copy">
        <h2 className="h3">{DOCUMENT_RENAME.title}</h2>
        <p className="b2 t3">{DOCUMENT_RENAME.body}</p>
      </div>
      <form
        id="doc-rename"
        className="name-field"
        onSubmit={(event) => {
          event.preventDefault()
          if (next === name) onClose()
          else if (next) onSave(next)
        }}
      >
        <span className="name-box">
          <input
            autoFocus
            value={value}
            maxLength={DOCUMENT_RENAME.max}
            placeholder={DOCUMENT_RENAME.placeholder}
            aria-label={DOCUMENT_RENAME.field}
            onChange={(event) => setValue(event.target.value)}
          />
          {value ? (
            <button
              type="button"
              className="name-clear"
              aria-label={DOCUMENT_RENAME.clear}
              onClick={() => setValue('')}
            >
              <Icon name="close" size={13} width={2.4} />
            </button>
          ) : null}
        </span>
        <span className="c1 t3 num">{`${[...value].length}/${DOCUMENT_RENAME.max}`}</span>
      </form>
      <div className="sheet-actions">
        <button type="button" className="btn sec" onClick={onClose}>
          {CANCEL_LABEL}
        </button>
        <button type="submit" form="doc-rename" className="btn pri" disabled={busy || !next}>
          {SAVE_LABEL}
        </button>
      </div>
    </Dialog>
  )
}

export default DocumentRenameDialog
