import type { Comment } from '@push/api-client'

export type CommentThread = { root: Comment; replies: Comment[] }

// replies hang under their top-level comment; a reply whose parent is missing stands on its own
export const threadComments = (comments: Comment[]): CommentThread[] => {
  const ids = new Set(comments.map((comment) => comment.id))
  const roots = comments.filter((comment) => !comment.parentId || !ids.has(comment.parentId))
  return roots.map((root) => ({ root, replies: comments.filter((comment) => comment.parentId === root.id) }))
}
