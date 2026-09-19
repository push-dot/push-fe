import { useQuery } from '@tanstack/react-query'
import { fetchMe } from './fetchers'

const keys = {
  me: ['auth-me'] as const,
}

export const useMe = () => useQuery({ queryKey: keys.me, queryFn: fetchMe })
