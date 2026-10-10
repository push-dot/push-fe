import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import type { AxeMatchers } from 'vitest-axe/matchers'
import { configureChatInference } from '@/features/chat/lib/inference-bridge'
import { useInferenceSettings } from '@/features/inference'
import i18n, { i18nReady } from '@/shared/i18n'

// jsdom reports navigator.language as en-US; tests assert Korean strings,
// so pin the locale the same way a stored preference would.
await i18nReady
await i18n.changeLanguage('ko')

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

configureChatInference({
  aiOptions: () => useInferenceSettings.getState().aiOptions(),
  ensureModels: () => useInferenceSettings.getState().loadModels(),
  accessMode: () => useInferenceSettings.getState().accessMode,
  byokKey: () => useInferenceSettings.getState().byokKey,
})

expect.extend(axeMatchers)

// vitest-axe only augments the legacy `Vi` namespace; Vitest 3 expects matcher
// types via module augmentation.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars -- interface merging must mirror vitest's Assertion signature
  interface Assertion<T = any> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- interface merging with vitest's AsymmetricMatchersContaining
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
