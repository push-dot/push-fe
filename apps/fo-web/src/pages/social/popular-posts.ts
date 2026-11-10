import type { PageParams, Post } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'

import { postsList } from '../../entities/post'
import { POPULAR_COUNT, POPULAR_FETCH } from './constants'

// 이번 주 많이 본 글: push-be sort=popular orders by view count, period=week keeps posts from the last 7 days.
// api-client's PageParams has neither field yet, and the mock ignores both
export const POPULAR_PARAMS: PageParams & { sort: 'popular'; period: 'week' } = { limit: POPULAR_FETCH, sort: 'popular', period: 'week' }

export const topByViews = (posts: Post[]) => [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, POPULAR_COUNT)

export const usePopularPosts = () =>
  useQuery({ queryKey: ['posts', 'popular'], queryFn: () => postsList(null, POPULAR_PARAMS), select: (page) => topByViews(page.data) })
