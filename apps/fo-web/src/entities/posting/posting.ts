import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  meBookmarks as fetchBookmarks,
  postingsGet as fetchPosting,
  postingsList as fetchPostings,
  postingsLocations as fetchPostingLocations,
  postingsMine as fetchMyPostings,
} from '../../shared/api/operations'

export const postingsGet = (...args: Parameters<typeof fetchPosting>) => fetchPosting(...args)
export const postingsList = (...args: Parameters<typeof fetchPostings>) => fetchPostings(...args)
export const postingsLocations = (...args: Parameters<typeof fetchPostingLocations>) => fetchPostingLocations(...args)
export const postingsMine = (...args: Parameters<typeof fetchMyPostings>) => fetchMyPostings(...args)
export const meBookmarks = (...args: Parameters<typeof fetchBookmarks>) => fetchBookmarks(...args)

export const usePostingList = (sort: 'latest' | 'deadline' | 'popular') =>
  useQuery({
    queryKey: ['postings', { sort }],
    queryFn: () => postingsList({ sort }),
  })

export const useMyPostings = () => useQuery({ queryKey: ['company-postings'], queryFn: () => postingsMine() })

export const useBookmarks = (enabled = true) =>
  useQuery({ queryKey: ['bookmarks'], queryFn: () => meBookmarks(), enabled })

export const useEmployerPosting = (id: string | undefined) =>
  useQuery({
    queryKey: ['employer-posting', id],
    queryFn: () => postingsGet(id ?? ''),
    enabled: Boolean(id),
  })

export const usePostingPages = (queryKey: unknown[], query: Parameters<typeof postingsList>[0], enabled = true) =>
  useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => postingsList({ ...query, cursor: pageParam }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
    enabled,
  })

export const usePostingCount = (queryKey: unknown[], query: Parameters<typeof postingsList>[0], enabled: boolean) =>
  useQuery({ queryKey, queryFn: () => postingsList(query), enabled })

export const usePostingLocations = (
  queryKey: unknown[],
  query: Parameters<typeof postingsLocations>[0],
  enabled: boolean,
) => useQuery({ queryKey, queryFn: () => postingsLocations(query), enabled })
