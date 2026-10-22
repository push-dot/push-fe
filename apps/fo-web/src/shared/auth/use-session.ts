import type { Session } from '@push/api-client'
import { useEffect, useState } from 'react'
import { sessionStore } from './session'

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(() => sessionStore.load())
  useEffect(() => sessionStore.subscribe(() => setSession(sessionStore.load())), [])
  return session
}
