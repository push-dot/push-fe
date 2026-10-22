import { useQuery } from '@tanstack/react-query'
import { searchCatalog as fetchCatalog } from '../../shared/api/operations'

export const searchCatalog = (...args: Parameters<typeof fetchCatalog>) => fetchCatalog(...args)

export const useSearchPostings = (q: string, enabled: boolean) =>
  useQuery({ queryKey: ['search', 'postings', q], queryFn: () => searchCatalog(q, 'postings'), enabled })

export const useSearchPeople = (q: string, enabled: boolean) =>
  useQuery({ queryKey: ['search', 'people', q], queryFn: () => searchCatalog(q, 'people'), enabled })

export const useSearchPosts = (q: string, enabled: boolean) =>
  useQuery({ queryKey: ['search', 'posts', q], queryFn: () => searchCatalog(q, 'posts'), enabled })
