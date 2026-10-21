import { mockSession, setMockPersona, type MockPersona } from '../shared/api/mock'
import type { createSessionStore } from '../shared/auth/session'

type SessionStore = ReturnType<typeof createSessionStore>

const PERSONAS: readonly MockPersona[] = ['personal', 'employer', 'employer-pro', 'employer-ultra', 'employer-new']

const personaFrom = (value: string | null): MockPersona | null => PERSONAS.find((item) => item === value) ?? null

export const applyMockSearch = (search: string, store: SessionStore) => {
  const params = new URLSearchParams(search)
  if (!params.has('mock')) return
  const persona = personaFrom(params.get('as'))
  setMockPersona(persona)
  if (persona) store.save(mockSession(persona))
  else store.clear()
}
