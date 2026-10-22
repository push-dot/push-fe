export type KeyValueStore = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export const browserLocalStorage = (): KeyValueStore | null =>
  typeof localStorage === 'undefined' ? null : localStorage

export const browserSessionStorage = (): KeyValueStore | null =>
  typeof sessionStorage === 'undefined' ? null : sessionStorage
