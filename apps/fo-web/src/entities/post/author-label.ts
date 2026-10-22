import type { SocialAuthor } from '@push/api-client'

export const authorLabel = (author: SocialAuthor) =>
  author.employer ? author.companyName || author.displayName : author.displayName
