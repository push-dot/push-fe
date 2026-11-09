import { useQuery } from '@tanstack/react-query'
import { authMe as fetchAuthMe, meConsents as fetchConsents, meSettings as fetchSettings } from '../../shared/api/operations'

export const authMe = (...args: Parameters<typeof fetchAuthMe>) => fetchAuthMe(...args)
export const meSettings = (...args: Parameters<typeof fetchSettings>) => fetchSettings(...args)
export const meConsents = (...args: Parameters<typeof fetchConsents>) => fetchConsents(...args)

export const useAuthMe = (enabled = true) => useQuery({ queryKey: ['auth', 'me'], queryFn: () => authMe(), enabled })

export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: () => meSettings() })

export const useConsents = () => useQuery({ queryKey: ['consents'], queryFn: () => meConsents() })
