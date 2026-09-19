import { create } from 'zustand'
import type { AccessMode, AiModel, AiOptions } from '@/shared/api'
import { fetchBilling, listAiModels } from '@/shared/api'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

const BYOK_KEY_STORAGE = 'push-byok-key'
const BYOK_MODEL_STORAGE = 'push-byok-model'
const BYOK_PROVIDER_STORAGE = 'push-byok-provider'
const CREDENTIAL_MODE_STORAGE = 'push-credential-mode'

export type ByokProvider = 'OPENAI' | 'OPENROUTER' | 'GROK' | 'CLAUDE'

type InferenceSettingsState = {
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  ultraResume: boolean
  webSearch: boolean
  accessMode: AccessMode
  credentialMode: 'MANAGED' | 'BYOK'
  byokKey: string
  byokModel: string
  byokProvider: ByokProvider
  models: AiModel[]
  modelsStatus: LoadStatus
  selectedModel: string | null
  plan: string | null
  setEffort: (effort: 'LOW' | 'MEDIUM' | 'HIGH') => void
  setUltraResume: (on: boolean) => void
  setWebSearch: (on: boolean) => void
  setAccessMode: (mode: AccessMode) => void
  setCredentialMode: (mode: 'MANAGED' | 'BYOK') => void
  setByokKey: (key: string) => void
  setByokModel: (model: string) => void
  setByokProvider: (provider: ByokProvider) => void
  setModel: (model: string) => void
  loadModels: () => Promise<void>
  aiOptions: () => AiOptions | null
}

export const useInferenceSettings = create<InferenceSettingsState>()((set, get) => ({
  effort: 'MEDIUM',
  ultraResume: false,
  webSearch: false,
  accessMode: 'SUGGEST',
  credentialMode: localStorage.getItem(CREDENTIAL_MODE_STORAGE) === 'BYOK' ? 'BYOK' : 'MANAGED',
  byokKey: localStorage.getItem(BYOK_KEY_STORAGE) ?? '',
  byokModel: localStorage.getItem(BYOK_MODEL_STORAGE) ?? 'gpt-4o-mini',
  byokProvider: ((): ByokProvider => {
    const v = localStorage.getItem(BYOK_PROVIDER_STORAGE)
    return v === 'OPENROUTER' || v === 'GROK' || v === 'CLAUDE' ? v : 'OPENAI'
  })(),
  models: [],
  modelsStatus: 'idle',
  selectedModel: null,
  plan: null,
  setEffort: (effort) => set({ effort }),
  setUltraResume: (ultraResume) => set({ ultraResume }),
  setWebSearch: (webSearch) => set({ webSearch }),
  setAccessMode: (accessMode) => set({ accessMode }),
  setCredentialMode: (credentialMode) => {
    localStorage.setItem(CREDENTIAL_MODE_STORAGE, credentialMode)
    set({ credentialMode })
  },
  setByokKey: (byokKey) => {
    localStorage.setItem(BYOK_KEY_STORAGE, byokKey)
    set({ byokKey })
  },
  setByokModel: (byokModel) => {
    localStorage.setItem(BYOK_MODEL_STORAGE, byokModel)
    set({ byokModel })
  },
  setByokProvider: (byokProvider) => {
    localStorage.setItem(BYOK_PROVIDER_STORAGE, byokProvider)
    set({ byokProvider })
  },
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
    if (s.credentialMode === 'BYOK') {
      if (!s.byokKey || !s.byokModel) return null
      return {
        provider: s.byokProvider,
        model: s.byokModel,
        credentialMode: 'BYOK',
        effort: s.effort,
        ultraResume: s.ultraResume,
        webSearch: s.webSearch,
      }
    }
    const model =
      s.models.find((m) => m.available && m.model === s.selectedModel) ??
      s.models.find((m) => m.available)
    if (!model) return null
    return {
      provider: 'OPENAI',
      model: model.model,
      credentialMode: 'MANAGED',
      effort: s.effort,
      ultraResume: s.ultraResume,
      webSearch: s.webSearch,
    }
  },
}))
