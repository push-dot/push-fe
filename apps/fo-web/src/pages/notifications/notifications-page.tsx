import { useNotifications } from '../../entities/notification'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import Skeleton from '../../shared/ui/skeleton'
import { NOTIFICATION_EMPTY, NOTIFICATION_ERROR, NOTIFICATION_NOTE, NOTIFICATION_READ_ALL, NOTIFICATION_TITLE } from './constants'
import NoticeRow from './notice-row'
import { useNoticeActions } from './use-notice-actions'


const NotificationsPage = () => {
  const query = useNotifications()
  const { read, open } = useNoticeActions()
  const items = query.data?.data ?? []
  return (
    <main className="page">
      <header className="head social-head">
        <h1 className="h1">{NOTIFICATION_TITLE}</h1>
        <button type="button" className="text-link" disabled={read.isPending || items.length === 0} onClick={() => read.mutate('all')}>
          {NOTIFICATION_READ_ALL}
        </button>
      </header>
      {query.isLoading ? <Skeleton rows={5} /> : null}
      {query.isError ? <ErrorState title={NOTIFICATION_ERROR} onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.isError && items.length === 0 ? <StateBlock icon="bell" title={NOTIFICATION_EMPTY} /> : null}
      {items.length > 0 ? (
        <div className="notice-list">
          {items.map((notice) => (
            <NoticeRow key={notice.id} notice={notice} onOpen={(next) => void open(next)} />
          ))}
        </div>
      ) : null}
      <p className="c1 t3">{NOTIFICATION_NOTE}</p>
    </main>
  )
}

export default NotificationsPage
