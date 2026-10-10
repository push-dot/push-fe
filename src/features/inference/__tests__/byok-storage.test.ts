import { beforeEach, describe, expect, it } from 'vitest'
import { BYOK_KEY_STORAGE } from '../constants'
import { useInferenceSettings } from '../stores'

describe('BYOK key storage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('writes the key to sessionStorage and evicts localStorage', () => {
    localStorage.setItem(BYOK_KEY_STORAGE, 'legacy')
    useInferenceSettings.getState().setByokKey('k-new')
    expect(sessionStorage.getItem(BYOK_KEY_STORAGE)).toBe('k-new')
    expect(localStorage.getItem(BYOK_KEY_STORAGE)).toBeNull()
    expect(useInferenceSettings.getState().byokKey).toBe('k-new')
  })
})
