import * as Sentry from '@sentry/react'

let initialized = false

export const initObservability = () => {
  if (initialized) return
  initialized = true
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0.2,
  })
}

export { Sentry }
