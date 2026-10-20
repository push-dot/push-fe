import { configureAxe } from 'vitest-axe'

// jsdom has no layout/paint engine, so color-contrast can never produce a real
// verdict under vitest (it would land in `incomplete` and spam jsdom canvas
// errors). Real contrast coverage comes from the Lighthouse audit.
export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})
