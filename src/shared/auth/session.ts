import { create } from 'zustand'

export type SessionUser = {
  id: string
  displayName: string
  locale: string
}

export type Session = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: SessionUser
}

type SessionState = {
  session: Session | null
  setSession: (session: Session) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}))

export const getAccessToken = (): string | null =>
  useSessionStore.getState().session?.accessToken ?? null
