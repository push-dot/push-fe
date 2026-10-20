import { formatDateTime } from '@/shared/lib/format'
import { DataListRow } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { InterviewSession } from '../api/schemas'

const InterviewRow = ({ session }: { session: InterviewSession }) => {
  const t = useT()
  return (
    <DataListRow
      title={session.title}
      meta={`${formatDateTime(session.scheduledAt)}${session.durationMinutes ? ` · ${t('interviews.minutes', { count: session.durationMinutes })}` : ''}`}
    />
  )
}

export default InterviewRow
