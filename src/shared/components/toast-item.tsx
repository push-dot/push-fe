import { useEffect } from 'react'
import Icon from './icon'
import type { ToastItem } from './toast'

const ToastItemView = ({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4_000)
    return () => clearTimeout(timer)
  }, [onDismiss])
  return (
    <div className="toast" role="status">
      {toast.icon ? <Icon name={toast.icon} size={16} /> : null}
      {toast.message}
    </div>
  )
}

export default ToastItemView
