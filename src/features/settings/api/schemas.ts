

export type AiModel = {
  provider: 'OPENAI' | 'OPENROUTER' | 'CLAUDE' | 'GEMINI' | 'GROK'
  model: string
  label: string
  available: boolean
  supportedEfforts: ('LOW' | 'MEDIUM' | 'HIGH')[]
}
