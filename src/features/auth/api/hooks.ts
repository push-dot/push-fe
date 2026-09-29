import { useMutation, useQuery } from '@tanstack/react-query'
import { exchangeCode, fetchMe, startOAuth } from './fetchers'
import type { AuthProvider } from './schemas'

const keys = {
  me: ['auth-me'] as const,
}

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: fetchMe })

export const useStartOAuth = () =>
  useMutation({ mutationFn: (provider: AuthProvider) => startOAuth(provider) })

export const useExchangeCode = () =>
  useMutation({ mutationFn: (code: string) => exchangeCode(code) })
