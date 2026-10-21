import { browserLocalStorage, type KeyValueStore } from '../../shared/lib/storage'
import { RECENT_SEARCH_KEY, RECENT_SEARCH_LIMIT } from './constants'

const readStored = (storage: KeyValueStore | null): string[] => {
  const raw = storage?.getItem(RECENT_SEARCH_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, RECENT_SEARCH_LIMIT)
  } catch {
    return []
  }
}

export const readRecentSearches = (storage: KeyValueStore | null = browserLocalStorage()) => readStored(storage)

export const saveRecentSearch = (term: string, storage: KeyValueStore | null = browserLocalStorage()) => {
  const cleaned = term.trim()
  if (!cleaned) return readStored(storage)
  const next = [cleaned, ...readStored(storage).filter((item) => item !== cleaned)].slice(0, RECENT_SEARCH_LIMIT)
  storage?.setItem(RECENT_SEARCH_KEY, JSON.stringify(next))
  return next
}

export const clearRecentSearches = (storage: KeyValueStore | null = browserLocalStorage()) => {
  storage?.removeItem(RECENT_SEARCH_KEY)
}
