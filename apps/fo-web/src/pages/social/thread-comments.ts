import type { Comment } from '@push/api-client'

export type CommentThread = { root: Comment; replies: Comment[] }

// replies at any depth hang under their top-level comment; a reply whose parent is missing stands on its own
export const threadComments = (comments: Comment[]): CommentThread[] => {
  const byId = new Map(comments.map((comment) => [comment.id, comment]))
  const rootOf = (comment: Comment) => {
    const seen = new Set<string>()
    let node = comment
    while (node.parentId && byId.has(node.parentId) && !seen.has(node.id)) {
      seen.add(node.id)
      node = byId.get(node.parentId)!
    }
    return node
  }
  const roots = comments.filter((comment) => !comment.parentId || !byId.has(comment.parentId))
  return roots.map((root) => ({ root, replies: comments.filter((comment) => comment !== root && rootOf(comment) === root) }))
}
