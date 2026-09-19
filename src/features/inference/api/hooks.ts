import { useQuery } from '@tanstack/react-query'
import { listAiModels } from './fetchers'

const keys = {
  models: ['ai-models'] as const,
}

export const useAiModels = () =>
  useQuery({
    queryKey: keys.models,
    queryFn: () =>
      listAiModels({ provider: 'OPENAI', credentialMode: 'MANAGED' }).then((env) => env.data),
  })

export const useByokModels = (provider: string, byokKey: string) =>
  useQuery({
    queryKey: ['ai-models', 'byok', provider, byokKey],
    enabled: Boolean(byokKey),
    queryFn: () =>
      listAiModels({ provider, credentialMode: 'BYOK', byokKey }).then((env) => env.data),
  })
