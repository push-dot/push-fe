import type { MockPersona } from '../shared/api/mock'
import { loadMock } from '../shared/api/mock-loader'
import { savePkceVerifier } from '../shared/auth/pkce'
import { mockBuild } from '../shared/lib/bridge'
import type { createSessionStore } from '../shared/auth/session'
import { registerMockBrandColors } from '../shared/api/mock-brand'

type SessionStore = ReturnType<typeof createSessionStore>

const PERSONAS: readonly MockPersona[] = ['personal', 'employer', 'employer-pro', 'employer-ultra', 'employer-new']

const personaFrom = (value: string | null): MockPersona | null => PERSONAS.find((item) => item === value) ?? null

export const applyMockSearch = async (search: string, store: SessionStore) => {
  const params = new URLSearchParams(search)
  if (!mockBuild || !params.has('mock')) return
  registerMockBrandColors()
  const { mockSession, mockSwitch, setMockPersona, setMockSwitches } = await loadMock()
  setMockSwitches(params.get('ms'))
  if (mockSwitch('auth-exchange-wait')) savePkceVerifier('mock-verifier')
  const persona = personaFrom(params.get('as'))
  setMockPersona(persona)
  if (persona) store.save(mockSession(persona))
  else store.clear()
}
