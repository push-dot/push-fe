import { Card } from '@/shared/components'
import type { InterviewSession } from '../api/schemas'

const ReflectionCard = ({ session }: { session: InterviewSession }) => (
  <Card title={`회고 — ${session.title}`}>
    <p className="t-body-sm">{session.reflection}</p>
  </Card>
)

export default ReflectionCard
