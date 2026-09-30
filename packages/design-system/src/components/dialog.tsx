import { Modal } from '@mantine/core'
import type { ReactNode } from 'react'
import { dialog, dialogActions, dialogOverlay, dialogTitle } from '../styles.css'
import { vars } from '../vars.css'

export type DialogProps = {
  open: boolean
  title: string
  children: ReactNode
  actions?: ReactNode
  onClose?: () => void
}

const Dialog = ({ open, onClose, title, children, actions }: DialogProps) => (
  <Modal
    opened={open}
    onClose={() => onClose?.()}
    title={title}
    centered
    withCloseButton={false}
    zIndex={vars.z.dialog}
    classNames={{ content: dialog, title: dialogTitle, overlay: dialogOverlay }}
    vars={() => ({ root: { '--modal-size': vars.size.dialogW } })}
  >
    {children}
    {actions ? <div className={dialogActions}>{actions}</div> : null}
  </Modal>
)

export default Dialog
