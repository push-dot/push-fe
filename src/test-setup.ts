import '@testing-library/jest-dom/vitest'
import { configureChatInference } from '@/features/chat/lib/inference-bridge'
import { useInferenceSettings } from '@/features/inference'
import i18n, { i18nReady } from '@/shared/i18n'

// jsdom reports navigator.language as en-US; tests assert Korean strings,
// so pin the locale the same way a stored preference would.
await i18nReady
await i18n.changeLanguage('ko')

configureChatInference({
  aiOptions: () => useInferenceSettings.getState().aiOptions(),
  ensureModels: () => useInferenceSettings.getState().loadModels(),
  accessMode: () => useInferenceSettings.getState().accessMode,
  byokKey: () => useInferenceSettings.getState().byokKey,
})
