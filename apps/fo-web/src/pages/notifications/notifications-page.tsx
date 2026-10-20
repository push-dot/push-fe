import type { WebNotification } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { notificationPath } from './notification-path'

const NotificationsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['notifications'], queryFn: () => api.me.webNotifications() })
  const read = useMutation({
    mutationFn: (ids: string[] | 'all') => api.me.readNotifications(ids),
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
        <button type="button" className="text-link" disabled={read.isPending} onClick={() => read.mutate('all')}>
          모두 읽음
        </button>
      </header>
      {query.isError ? <p className="b2 t3">알림을 불러오지 못했어요.</p> : null}
      {!query.isLoading && items.length === 0 ? <p className="b2 t3">알림이 없어요.</p> : null}
      <ul className="activity-list">
        {items.map((notice) => (
          <li key={notice.id}>
            <button type="button" className={notice.readAt ? 'notice read' : 'notice'} onClick={() => void open(notice)}>
              <strong className="b1">{notice.title}</strong>
              <span className="b2 t2">{notice.body}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default NotificationsPage
