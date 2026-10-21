import type { PostCategory } from '@push/api-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  mePosts as fetchMyPosts,
  postsComments as fetchComments,
  postsGet as fetchPost,
  postsList as fetchPosts,
} from '../../shared/api/operations'

export const postsGet = (...args: Parameters<typeof fetchPost>) => fetchPost(...args)
export const postsList = (...args: Parameters<typeof fetchPosts>) => fetchPosts(...args)
export const postsComments = (...args: Parameters<typeof fetchComments>) => fetchComments(...args)
export const mePosts = (...args: Parameters<typeof fetchMyPosts>) => fetchMyPosts(...args)

export const useMyPosts = (enabled = true) => useQuery({ queryKey: ['my-posts'], queryFn: () => mePosts(), enabled })

export const usePost = (id: string) => useQuery({ queryKey: ['post', id], queryFn: () => postsGet(id) })

export const usePostComments = (id: string) => useQuery({ queryKey: ['comments', id], queryFn: () => postsComments(id) })

export const usePostPages = (category: PostCategory | null, limit: number) =>
  useInfiniteQuery({
    queryKey: ['posts', category],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => postsList(category, { cursor: pageParam, limit }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
  })
