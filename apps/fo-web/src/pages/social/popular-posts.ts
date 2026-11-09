import type { PageParams, Post } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'

import { postsList } from '../../entities/post'
import { POPULAR_COUNT, POPULAR_FETCH } from './constants'

// push-be orders by view count for sort=popular; api-client's PageParams has no sort yet, and the mock ignores it
const POPULAR_PARAMS: PageParams & { sort: 'popular' } = { limit: POPULAR_FETCH, sort: 'popular' }

export const topByViews = (posts: Post[]) => [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, POPULAR_COUNT)

export const usePopularPosts = () =>
  useQuery({ queryKey: ['posts', 'popular'], queryFn: () => postsList(null, POPULAR_PARAMS), select: (page) => topByViews(page.data) })
