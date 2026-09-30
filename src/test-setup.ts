import '@testing-library/jest-dom/vitest'
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
