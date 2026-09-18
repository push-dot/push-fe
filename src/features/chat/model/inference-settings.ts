import { create } from 'zustand'
import type { AccessMode, AiModel, AiOptions } from '@/shared/api'
import { fetchBilling, listAiModels } from '@/shared/api'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type InferenceSettingsState = {
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  ultraResume: boolean
  accessMode: AccessMode
  models: AiModel[]
  modelsStatus: LoadStatus
  selectedModel: string | null
  plan: string | null
  setEffort: (effort: 'LOW' | 'MEDIUM' | 'HIGH') => void
  setUltraResume: (on: boolean) => void
  setAccessMode: (mode: AccessMode) => void
  setModel: (model: string) => void
  loadModels: () => Promise<void>
  aiOptions: () => AiOptions | null
}

export const useInferenceSettings = create<InferenceSettingsState>()((set, get) => ({
  effort: 'MEDIUM',
  ultraResume: false,
  accessMode: 'SUGGEST',
  models: [],
  modelsStatus: 'idle',
  selectedModel: null,
  plan: null,
  setEffort: (effort) => set({ effort }),
  setUltraResume: (ultraResume) => set({ ultraResume }),
  setAccessMode: (accessMode) => set({ accessMode }),
  setModel: (selectedModel) => set({ selectedModel }),
  loadModels: async () => {
    set({ modelsStatus: 'loading' })
    void fetchBilling()
      .then((b) => {
        set((s) => ({ plan: b.plan, ultraResume: s.ultraResume && b.plan === 'ULTRA' }))
      })
      .catch(() => set({ plan: null }))
    try {
      const env = await listAiModels({
        provider: 'OPENAI',
        credentialMode: 'MANAGED',
      })
      set({ models: env.data, modelsStatus: 'success' })
    } catch {
      set({ modelsStatus: 'error' })
    }
  },
  aiOptions: () => {
    const s = get()
    const model =
      s.models.find((m) => m.available && m.model === s.selectedModel) ??
      s.models.find((m) => m.available)
    if (!model) return null
    return {
      provider: 'OPENAI',
      model: model.model,
      credentialMode: 'MANAGED',
      effort: s.effort,
    }
  },
}))
