import { useQuery } from '@tanstack/react-query'
import { useHasSession } from '@/shared/auth/session'
import { listAiModels } from './fetchers'

const keys = {
  models: ['ai-models'] as const,
}

export const useAiModels = () =>
  useQuery({
    queryKey: keys.models,
    enabled: useHasSession(),
    queryFn: () =>
      listAiModels({ provider: 'OPENAI', credentialMode: 'MANAGED' }).then((env) => env.data),
  })

const fingerprint = (value: string) => {
  let hash = 5381
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}

export const useByokModels = (provider: string, byokKey: string) =>
  useQuery({
    queryKey: ['ai-models', 'byok', provider, fingerprint(byokKey)],
    enabled: Boolean(byokKey),
    queryFn: () =>
      listAiModels({ provider, credentialMode: 'BYOK', byokKey }).then((env) => env.data),
  })
