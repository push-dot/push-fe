import type { LinkKind, Source } from '@push/api-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { listSources } from '../../shared/api/sources'
import {
  meFollows as fetchFollows,
  meLinks as fetchLinks,
  meProfile as fetchMyProfile,
  profilesGet as fetchProfile,
  profilesList as fetchProfiles,
  sourcesGet,
} from '../../shared/api/operations'

export const profilesGet = (...args: Parameters<typeof fetchProfile>) => fetchProfile(...args)
export const profilesList = (...args: Parameters<typeof fetchProfiles>) => fetchProfiles(...args)
export const meProfile = (...args: Parameters<typeof fetchMyProfile>) => fetchMyProfile(...args)
export const meLinks = (...args: Parameters<typeof fetchLinks>) => fetchLinks(...args)
export const meFollows = (...args: Parameters<typeof fetchFollows>) => fetchFollows(...args)

export const loadDocuments = async (): Promise<Source[]> => {
  const [uploaded, profile] = await Promise.all([listSources(), meProfile()])
  if (!profile.resumeSourceId || uploaded.some((item) => item.id === profile.resumeSourceId)) return uploaded
  try {
    const resume = await sourcesGet(profile.resumeSourceId)
    return [resume, ...uploaded]
  } catch {
    return uploaded
  }
}

export const useMyProfile = (enabled = true) =>
  useQuery({ queryKey: ['me', 'profile'], queryFn: () => meProfile(), enabled })

export const useFollows = (enabled = true) => useQuery({ queryKey: ['follows'], queryFn: () => meFollows(), enabled })

export const useDocuments = () => useQuery({ queryKey: ['documents'], queryFn: loadDocuments })

export const useSources = () => useQuery({ queryKey: ['sources'], queryFn: () => listSources() })

export const useLinks = (kind: LinkKind | 'all') =>
  useQuery({
    queryKey: ['links', kind],
    queryFn: () => meLinks(kind === 'all' ? undefined : kind),
  })

export const useProfilePages = (queryKey: unknown[], query: Parameters<typeof profilesList>[0]) =>
  useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => profilesList({ ...query, cursor: pageParam }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
  })

export const useProfileCount = (queryKey: unknown[], query: Parameters<typeof profilesList>[0], enabled: boolean) =>
  useQuery({ queryKey, queryFn: () => profilesList(query), enabled })
