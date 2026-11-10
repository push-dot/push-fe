import type { PostCategory } from '@push/api-client'

import { POST_BODY_MAX, POST_TITLE_MAX } from './constants'

export type ComposeField = 'category' | 'title' | 'body'

export const invalidFields = (input: { category: PostCategory | ''; title: string; body: string }): Record<ComposeField, boolean> => ({
  category: input.category === '',
  title: input.title.trim().length < 1 || input.title.trim().length > POST_TITLE_MAX,
  body: input.body.trim().length < 1 || input.body.trim().length > POST_BODY_MAX,
})
