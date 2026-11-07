import { useEffect, useId } from 'react'
import { create } from 'zustand'
import { TOAST_MS } from './constants'

export type ToastTone = 'success' | 'error'
export type ToastInput = {
  message: string
  action?: { label: string; onPress: () => void }
  /** Leading status icon. Leave unset on undo/action toasts. */
  tone?: ToastTone
  /** Distance above the bottom safe inset, to clear a tab bar or CTA (see TOAST_ABOVE). Defaults to TOAST_BOTTOM_GAP. */
  bottom?: number
}
export type Toast = ToastInput & { id: number }

/** Artboard toast bottoms above the safe inset, given the tab bar's height above it. */
export const toastOffsets = (tabBar: number) => ({ tabs: tabBar + 14, docsCta: tabBar + 100, docsError: tabBar + 150, cta: 92 }) as const

type State = { current: Toast | null; hosts: string[]; sheets: number }

export const useToastStore = create<State>(() => ({ current: null, hosts: [], sheets: 0 }))

let seq = 0

export const showToast = (toast: ToastInput) => useToastStore.setState({ current: { ...toast, id: ++seq } })

export const hideToast = (id: number) => useToastStore.setState((s) => (s.current?.id === id ? { current: null } : s))

/** Counts an open Android sheet, which the root toast draws above. */
export const mountSheet = () => {
  useToastStore.setState((s) => ({ sheets: s.sheets + 1 }))
  return () => useToastStore.setState((s) => ({ sheets: s.sheets - 1 }))
}

export const toastDuration = (toast: ToastInput) => (toast.action ? TOAST_MS.action : TOAST_MS.plain)

export const activeToastHost = (s: State) => s.hosts.at(-1)

export const mountToastHost = (id: string) => {
  useToastStore.setState((s) => ({ hosts: [...s.hosts, id] }))
  return () => useToastStore.setState((s) => ({ hosts: s.hosts.filter((h) => h !== id) }))
}

/** Registers the calling ToastHost; only the last mounted host shows toasts. */
export const useHostedToast = () => {
  const id = useId()
  useEffect(() => mountToastHost(id), [id])
  return useToastStore((s) => (activeToastHost(s) === id ? s.current : null))
}
