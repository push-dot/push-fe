import { useSyncExternalStore } from 'react'
import { browserLocalStorage } from './storage'

export const THEME_KEY = 'push-theme'
export const THEME_CHOICES = ['light', 'dark', 'system'] as const
export type ThemeChoice = (typeof THEME_CHOICES)[number]

const listeners = new Set<() => void>()

export const readTheme = (): ThemeChoice => {
  const stored = browserLocalStorage()?.getItem(THEME_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export const applyThemeChoice = (choice: ThemeChoice, root: { dataset: DOMStringMap }) => {
  if (choice === 'system') delete root.dataset.theme
  else root.dataset.theme = choice
}

export const setTheme = (choice: ThemeChoice) => {
  const storage = browserLocalStorage()
  if (choice === 'system') storage?.removeItem(THEME_KEY)
  else storage?.setItem(THEME_KEY, choice)
  applyThemeChoice(choice, document.documentElement)
  listeners.forEach((listener) => listener())
}

export const useTheme = () =>
  useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    readTheme,
    () => 'system' as const,
  )
