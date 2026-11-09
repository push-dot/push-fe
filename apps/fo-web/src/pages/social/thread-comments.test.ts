import type { Comment } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { threadComments } from './thread-comments'

const comment = (id: string, parentId?: string) => ({ id, parentId }) as Comment

describe('threadComments', () => {
  it('puts a reply right under its parent, keeping the order of the roots', () => {
    const threads = threadComments([comment('c1'), comment('c3'), comment('c2', 'c1')])
    expect(threads.map((thread) => [thread.root.id, thread.replies.map((reply) => reply.id)])).toEqual([
      ['c1', ['c2']],
      ['c3', []],
    ])
  })

  it('keeps a reply with a missing parent as its own thread', () => {
    expect(threadComments([comment('c2', 'gone')]).map((thread) => thread.root.id)).toEqual(['c2'])
  })
})
