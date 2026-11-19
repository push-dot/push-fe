import type { Session } from './types'

export type RefresherConfig = {
  /** Exchanges the stored session for a new one; throws on any failure. `current` is null when nothing is stored (cookie sessions). */
  refresh: (current: Session | null) => Promise<Session>
  load: () => Session | null
  save: (session: Session) => void | Promise<void>
  clear: () => void | Promise<void>
  /** Only a refusal of the session itself (401, invalid_grant) clears it; network and 5xx failures keep it. */
  isAuthFailure: (error: unknown) => boolean
  /** Serialises refreshes across tabs (e.g. Web Locks). Absent: in-tab single-flight only. */
  lock?: <T>(run: () => Promise<T>) => Promise<T>
}

/** One refresh at a time. Resolves true when a usable session is stored afterwards. */
export const createRefresher = (config: RefresherConfig) => {
  let inFlight: Promise<boolean> | null = null

  const run = async (before: string | undefined): Promise<boolean> => {
    const current = config.load()
    // Another tab (or call) already renewed or ended the session while this one waited.
    if (current?.accessToken !== before) return current !== null
    try {
      await config.save(await config.refresh(current))
      return true
    } catch (error) {
      if (config.isAuthFailure(error)) await config.clear()
      return false
    }
  }

  return () => {
    const before = config.load()?.accessToken
    inFlight ??= (config.lock ? config.lock(() => run(before)) : run(before)).finally(() => {
      inFlight = null
    })
    return inFlight
  }
}
