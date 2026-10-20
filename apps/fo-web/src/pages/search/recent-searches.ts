import { RECENT_SEARCH_KEY, RECENT_SEARCH_LIMIT } from './constants'

const storage = () => (typeof localStorage === 'undefined' ? null : localStorage)

export const readRecentSearches = (): string[] => {
  const raw = storage()?.getItem(RECENT_SEARCH_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, RECENT_SEARCH_LIMIT)
  } catch {
    return []
  }
}

export const saveRecentSearch = (term: string) => {
  const cleaned = term.trim()
  if (!cleaned) return readRecentSearches()
  const next = [cleaned, ...readRecentSearches().filter((item) => item !== cleaned)].slice(0, RECENT_SEARCH_LIMIT)
  storage()?.setItem(RECENT_SEARCH_KEY, JSON.stringify(next))
  return next
}

export const clearRecentSearches = () => {
  storage()?.removeItem(RECENT_SEARCH_KEY)
}
