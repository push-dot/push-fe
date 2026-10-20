import type { AccessMode, AiOptions } from '@/features/inference'

export type ChatInferenceDeps = {
  aiOptions: () => AiOptions | null
  ensureModels: () => Promise<void>
  accessMode: () => AccessMode
  byokKey: () => string
}

let inferenceDeps: ChatInferenceDeps | null = null

export const configureChatInference = (deps: ChatInferenceDeps) => {
  inferenceDeps = deps
}

export const chatInference = () => {
  if (!inferenceDeps) throw new Error('chat inference is not configured')
  return inferenceDeps
}
