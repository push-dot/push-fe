import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { ListEnvelope } from '@/shared/api'
import type { AiModel } from './schemas'

export const listAiModels = async (params?: {
  provider?: string
  credentialMode?: 'MANAGED' | 'BYOK'
  byokKey?: string
}): Promise<ListEnvelope<AiModel>> =>
  request(() =>
    api.get('ai/models', {
      searchParams: {
        ...(params?.provider ? { provider: params.provider } : {}),
        ...(params?.credentialMode ? { credentialMode: params.credentialMode } : {}),
      },
      headers: params?.byokKey ? { 'X-Byok-Key': params.byokKey } : {},
    }),
  )
