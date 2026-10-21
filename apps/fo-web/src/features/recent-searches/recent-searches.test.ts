import { describe, expect, it } from 'vitest'
import type { KeyValueStore } from '../../shared/lib/storage'
import { clearRecentSearches, readRecentSearches, saveRecentSearch } from './recent-searches'

const memory = (): KeyValueStore => {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value)
    },
    removeItem: (key) => {
      items.delete(key)
    },
  }
}

describe('recent searches', () => {
  it('keeps the newest unique terms and drops a blank save', () => {
    const storage = memory()
    expect(readRecentSearches(storage)).toEqual([])
    expect(saveRecentSearch('  kotlin  ', storage)).toEqual(['kotlin'])
    expect(saveRecentSearch('kotlin', storage)).toEqual(['kotlin'])
    expect(saveRecentSearch('ios', storage)).toEqual(['ios', 'kotlin'])
    expect(saveRecentSearch('   ', storage)).toEqual(['ios', 'kotlin'])
    clearRecentSearches(storage)
    expect(readRecentSearches(storage)).toEqual([])
  })

  it('ignores a stored value that is not a string list', () => {
    const storage = memory()
    storage.setItem('push-recent-searches', '{"no":1}')
    expect(readRecentSearches(storage)).toEqual([])
    storage.setItem('push-recent-searches', 'not-json')
    expect(readRecentSearches(storage)).toEqual([])
  })
})
