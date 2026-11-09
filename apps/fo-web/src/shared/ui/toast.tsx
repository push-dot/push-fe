import { useCallback, useEffect, useState } from 'react'
import { isWebView } from '../lib/bridge'
import { Icon } from './icon'

const TOAST_MS = 2800

export type ToastTone = 'ok' | 'err'
export type ToastAction = { label: string; onClick: () => void }
type ToastState = { message: string; tone: ToastTone; action?: ToastAction }

export const useToast = () => {
  const [state, setState] = useState<ToastState | null>(null)
  useEffect(() => {
    if (!state) return
    const timer = window.setTimeout(() => setState(null), state.action ? TOAST_MS * 2 : TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [state])
  const show = useCallback((message: string | null, options?: { tone?: ToastTone; action?: ToastAction }) => {
    setState(message ? { message, tone: options?.tone ?? 'ok', action: options?.action } : null)
  }, [])
  return { message: state?.message ?? null, tone: state?.tone, action: state?.action, show }
}

const Toast = ({ message, tone = 'ok', action }: { message: string | null; tone?: ToastTone; action?: ToastAction }) => {
  if (!message) return null
  return (
    <div className={tone === 'err' ? 'toast err' : 'toast'} role={tone === 'err' ? 'alert' : 'status'}>
      {isWebView() ? null : tone === 'err' ? <Icon name="info" size={20} width={2.2} className="toast-ic" /> : <Icon name="check" size={18} width={2.6} className="toast-ic" />}
      <span className="toast-text">{message}</span>
      {action ? (
        <button type="button" className="ta" onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  )
}

export default Toast
