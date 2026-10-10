import { Card } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { InterviewSession } from '../api/schemas'

const ReflectionCard = ({ session }: { session: InterviewSession }) => {
  const t = useT()
  return (
    <Card title={`${t('interviews.reflection')} — ${session.title}`}>
      <p className="t-body-sm">{session.reflection}</p>
    </Card>
  )
}

export default ReflectionCard
