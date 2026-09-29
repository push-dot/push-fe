import { formatDateTime } from '@/shared/lib/format'
import { DataListRow } from '@/shared/components'
import type { InterviewSession } from '../api/schemas'

const InterviewRow = ({ session }: { session: InterviewSession }) => (
  <DataListRow
    title={session.title}
    meta={`${formatDateTime(session.scheduledAt)}${session.durationMinutes ? ` · ${session.durationMinutes}분` : ''}`}
  />
)

export default InterviewRow
