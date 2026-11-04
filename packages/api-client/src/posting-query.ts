import type { PostingFilters } from './types'

export const withDeadlineWindow = <T extends Pick<PostingFilters, 'sort'>>(query: T) =>
  query.sort === 'deadline' ? { ...query, deadlineWithin: '7' as const } : query
