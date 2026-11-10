import { useQuery } from '@tanstack/react-query'
import { authMe as fetchAuthMe, meBlocks as fetchBlocks, meSettings as fetchSettings } from '../../shared/api/operations'

export const authMe = (...args: Parameters<typeof fetchAuthMe>) => fetchAuthMe(...args)
export const meSettings = (...args: Parameters<typeof fetchSettings>) => fetchSettings(...args)

export const useAuthMe = (enabled = true) => useQuery({ queryKey: ['auth', 'me'], queryFn: () => authMe(), enabled })

export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: () => meSettings() })

export const useBlocks = (enabled = true) => useQuery({ queryKey: ['blocks'], queryFn: () => fetchBlocks(), enabled })
