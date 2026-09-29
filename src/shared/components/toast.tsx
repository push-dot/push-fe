import { create } from 'zustand'
import type { IconName } from './icon'
import ToastItemView from './toast-item'

export type ToastItem = {
  id: number
  message: string
  icon?: IconName
}

type ToastState = {
  toasts: ToastItem[]
  show: (message: string, icon?: IconName) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  show: (message, icon) => set((s) => ({ toasts: [...s.toasts, { id: nextId++, message, icon }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const showToast = (message: string, icon: IconName = 'check'): void =>
  useToastStore.getState().show(message, icon)

const ToastHost = () => {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <>
      {toasts.map((t) => (
        <ToastItemView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </>
  )
}

export default ToastHost
