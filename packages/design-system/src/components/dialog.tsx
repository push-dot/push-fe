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

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    return () => restoreRef.current?.focus()
  }, [open])

  if (!open) return null
  return (
    <div className={dialogBackdrop} onClick={onClose}>
      <div
        className={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={dialogTitle}>{title}</div>
        {children}
        {actions ? <div className={dialogActions}>{actions}</div> : null}
      </div>
    </div>
  )
}

export default Dialog
