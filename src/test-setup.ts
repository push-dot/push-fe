import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import type { AxeMatchers } from 'vitest-axe/matchers'
import { configureChatInference } from '@/features/chat/lib/inference-bridge'
import { useInferenceSettings } from '@/features/inference'

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
