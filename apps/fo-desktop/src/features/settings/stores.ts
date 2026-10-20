import { create } from 'zustand'
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
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  theme: storedTheme(),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
