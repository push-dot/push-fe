export type AiModel = {
  provider: 'OPENAI' | 'OPENROUTER' | 'CLAUDE' | 'GEMINI' | 'GROK'
  model: string
  label: string
  available: boolean
  supportedEfforts: ('LOW' | 'MEDIUM' | 'HIGH')[]
}

export type AiOptions = {
  provider: 'OPENAI' | 'OPENROUTER' | 'CLAUDE' | 'GEMINI' | 'GROK'
  model: string
  credentialMode: 'MANAGED' | 'BYOK'
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  ultraResume?: boolean
  webSearch?: boolean
}

export type AccessMode = 'SUGGEST' | 'CONFIRM_ACTIONS'
