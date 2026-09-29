import '@testing-library/jest-dom/vitest'
import { configureChatInference } from '@/features/chat/inference-bridge'
import { useInferenceSettings } from '@/features/inference'

configureChatInference({
  aiOptions: () => useInferenceSettings.getState().aiOptions(),
  ensureModels: () => useInferenceSettings.getState().loadModels(),
  accessMode: () => useInferenceSettings.getState().accessMode,
  byokKey: () => useInferenceSettings.getState().byokKey,
})
