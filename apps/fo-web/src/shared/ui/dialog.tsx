import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { openerOf, returnFocus, trapTab } from './focus'

type DialogProps = { label: string; onClose: () => void; wide?: boolean; className?: string; children: ReactNode }

export const useEscape = (onClose: () => void) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

export const Dialog = ({ label, onClose, wide = false, className, children }: DialogProps) => {
  const ref = useRef<HTMLDivElement>(null)
  // Read while rendering: by the first effect an autoFocus field inside already holds focus.
  const [opener] = useState(() => openerOf(document.activeElement))
  useEscape(onClose)
  useEffect(() => {
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus()
  }, [])
  useLayoutEffect(() => {
    const dialog = ref.current
    return () => returnFocus(opener, dialog)
  }, [opener])
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        className={['sheet', wide ? 'wide' : '', className ?? ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => ref.current && trapTab(ref.current, event)}
      >
        {children}
      </div>
    </div>
  )
}

type ConfirmProps = {
  title: string
  body?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export const ConfirmDialog = ({ title, body, confirmLabel, cancelLabel = '취소', danger = false, busy = false, onConfirm, onClose }: ConfirmProps) => (
  <Dialog label={title} onClose={onClose} className="confirm">
    <div className="confirm-copy">
      <h2 className="h3">{title}</h2>
      {body ? <div className="b2 t3">{body}</div> : null}
    </div>
    <div className="sheet-actions">
      <button type="button" className="btn sec" onClick={onClose}>
        {cancelLabel}
      </button>
      <button type="button" className={danger ? 'btn danger' : 'btn pri'} disabled={busy} onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </Dialog>
)
