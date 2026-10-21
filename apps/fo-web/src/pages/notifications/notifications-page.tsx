import type { WebNotification } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { relativeTime } from '../../shared/lib/format'
import { NOTIFICATION_EMPTY, NOTIFICATION_ERROR, NOTIFICATION_NOTE, NOTIFICATION_READ_ALL } from './constants'
import { notificationPath } from './notification-path'
import { meWebNotifications, meReadNotifications } from '../../shared/api/operations'


const NotificationsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['notifications'], queryFn: () => meWebNotifications() })
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
      {query.isError ? <p className="b2 t3">{NOTIFICATION_ERROR}</p> : null}
      {!query.isLoading && items.length === 0 ? <p className="b2 t3">{NOTIFICATION_EMPTY}</p> : null}
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
