import type { WebNotification } from '@push/api-client'

import { relativeTime } from '../../shared/lib/format'
import { NOTIFICATION_KIND } from './constants'

type NoticeRowProps = { notice: WebNotification; onOpen: (notice: WebNotification) => void }

const NoticeRow = ({ notice, onOpen }: NoticeRowProps) => {
  const kind = NOTIFICATION_KIND[notice.type]
  return (
    <button type="button" className={notice.readAt ? 'notif-row read' : 'notif-row'} onClick={() => onOpen(notice)}>
      <span className="notif-ic" style={{ background: kind.color }} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={kind.path} />
        </svg>
      </span>
      <span className="notif-copy">
        <span className={notice.readAt ? 'b2 w6' : 'b2 w7'}>{notice.title}</span>
        <span className="c1 t3">{notice.body}</span>
      </span>
      <span className="c2 t3">{relativeTime(notice.createdAt)}</span>
    </button>
  )
}

export default NoticeRow
