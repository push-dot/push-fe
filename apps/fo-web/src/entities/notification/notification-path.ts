import type { WebNotification } from '@push/api-client'

export const notificationPath = (notice: Pick<WebNotification, 'type' | 'target'>) => {
  if (notice.type === 'APPLICATION_STAGE' || notice.target.kind === 'activity') return '/me?tab=activity&chip=applications'
  if (notice.target.kind === 'posting') return `/postings/${notice.target.id}`
  if (notice.target.kind === 'offer') return `/offers/${notice.target.id}`
  if (notice.target.kind === 'post') return `/posts/${notice.target.id}`
  return null
}
