import { router } from 'expo-router'
import { create } from 'zustand'
import { clearToast } from './toast-store'

export type ConfirmRequest = {
  title: string
  body: string
  confirm: string
  cancel?: string
  danger?: boolean
  onConfirm: () => void
}

export type ConfirmHref = '/confirm' | '/(app)/(stack)/(tabs)/(my)/confirm'

type ConfirmState = { request: ConfirmRequest | null; set: (request: ConfirmRequest | null) => void }

export const useConfirmStore = create<ConfirmState>()((set) => ({
  request: null,
  set: (request) => set({ request }),
}))

// Android draws toasts above native sheets, so a lingering undo snackbar would cover the confirm button.
export const askConfirm = (request: ConfirmRequest, href: ConfirmHref = '/confirm') => {
  clearToast()
  useConfirmStore.getState().set(request)
  router.push(href)
}
