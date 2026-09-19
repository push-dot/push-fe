import { create } from 'zustand'
import {  AiModel, BillingSummary  } from './api/fetchers'
import { AuthUser } from '@/features/auth'
import {  fetchBilling, listAiModels  } from './api/fetchers'
import { fetchMe } from '@/features/auth'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

import { APPEARANCE_KEY } from './constants'

export type Theme = 'light' | 'dark'

const storedTheme = (): Theme => {
  const v = localStorage.getItem(APPEARANCE_KEY)
  return v === 'dark' ? 'dark' : 'light'
}

export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(APPEARANCE_KEY, theme)
}

type SettingsState = {
  me: AuthUser | null
  billing: BillingSummary | null
  models: AiModel[]
  status: LoadStatus
  error: string | null
  theme: Theme
  setTheme: (theme: Theme) => void
  load: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  me: null,
  billing: null,
  models: [],
  status: 'idle',
  error: null,
  theme: storedTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  load: async () => {
    set({ status: 'loading', error: null })
    try {
      const [me, billing, models] = await Promise.allSettled([
        fetchMe(),
        fetchBilling(),
        listAiModels({ provider: 'OPENAI', credentialMode: 'MANAGED' }),
      ])
      set({
        me: me.status === 'fulfilled' ? me.value : null,
        billing: billing.status === 'fulfilled' ? billing.value : null,
        models: models.status === 'fulfilled' ? models.value.data : [],
        status: 'success',
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'error',
      })
    }
  },
}))
