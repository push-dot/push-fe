import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { dialog, dialogActions, dialogBackdrop, dialogTitle } from '../styles.css'

export type DialogProps = {
  open: boolean
  title: string
  children: ReactNode
  actions?: ReactNode
  onClose?: () => void
}

const Dialog = ({ open, onClose, title, children, actions }: DialogProps) => {
  const restoreRef = useRef<HTMLElement | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      restoreRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    // Backdrop dismiss is pointer-only; the Escape keydown handler above is the
    // keyboard equivalent, so no key listener is attached here.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={dialogBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={dialogRef}
        className={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={dialogTitle}>{title}</div>
        {children}
        {actions ? <div className={dialogActions}>{actions}</div> : null}
      </div>
    </div>
  )
}

export default Dialog
