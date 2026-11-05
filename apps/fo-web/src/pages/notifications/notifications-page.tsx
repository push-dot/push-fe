import type { WebNotification } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { relativeTime } from '../../shared/lib/format'
import Skeleton from '../../shared/ui/skeleton'
import { NOTIFICATION_EMPTY, NOTIFICATION_ERROR, NOTIFICATION_NOTE, NOTIFICATION_READ_ALL } from './constants'
import { notificationPath, useNotifications } from '../../entities/notification'
import { meReadNotifications } from '../../features/read-notifications'


const NotificationsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useNotifications()
  const read = useMutation({
    mutationFn: (ids: string[] | 'all') => meReadNotifications(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
  const open = async (notice: WebNotification) => {
    await read.mutateAsync([notice.id])
    const path = notificationPath(notice)
    if (path) navigate(path)
  }
  const items = query.data?.data ?? []
  return (
    <main className="page">
      <header className="head social-head">
        <h1 className="h1">알림</h1>
        <button type="button" className="text-link" disabled={read.isPending || items.length === 0} onClick={() => read.mutate('all')}>
          {NOTIFICATION_READ_ALL}
        </button>
      </header>
      {query.isLoading ? <Skeleton rows={5} /> : null}
      {query.isError ? <p className="b1 w7">{NOTIFICATION_ERROR}</p> : null}
      {!query.isLoading && items.length === 0 ? (
        <div className="empty-block">
          <span className="bell-tile" aria-hidden="true">
            <svg className="ic" viewBox="0 0 24 24">
              <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15ZM10 20.5a2 2 0 0 0 4 0" />
            </svg>
          </span>
          <p className="b1 w7">{NOTIFICATION_EMPTY}</p>
        </div>
      ) : null}
      {items.length > 0 ? (
        <div className="box notice-list">
          {items.map((notice) => (
            <button key={notice.id} type="button" className={notice.readAt ? 'notice-row notice read' : 'notice-row notice'} onClick={() => void open(notice)}>
              <span className="doc-copy">
                <strong className="b1">{notice.title}</strong>
                <span className="b2 t2">{notice.body}</span>
              </span>
              <span className="c1 t3">{relativeTime(notice.createdAt)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <p className="c1 t3">{NOTIFICATION_NOTE}</p>
    </main>
  )
}

export default NotificationsPage
