import { Card, Button, StatusChip } from '@/shared/components'
import type { Application } from '../api/schemas'
import { stageChipTone } from '../lib/application-chip'

const STAGE_META: Record<string, string> = {
  DISCOVERED: '공고 분석 중',
  PREPARING: '서류 준비 중',
  READY: '제출 준비 완료',
  APPLIED: '지원 완료',
  SCREENING: '서류 심사 중',
  INTERVIEW: '면접 진행 중',
  OFFER: '오퍼',
  ACCEPTED: '합격',
  REJECTED: '불합격',
  WITHDRAWN: '지원 철회',
}

type ApplicationCardProps = {
  application: Application
  running: boolean
  onOpen: () => void
  onRun: () => void
}

const ApplicationCard = ({ application, running, onOpen, onRun }: ApplicationCardProps) => (
  <Card
    title={`${application.company} ${application.title}`}
    meta={STAGE_META[application.stage]}
    onClick={onOpen}
  >
    <StatusChip tone={stageChipTone(application.stage)} label={application.stage} />
    <Button
      variant="ghost"
      size="sm"
      disabled={running}
      onClick={(e) => {
        e.stopPropagation()
        onRun()
      }}
    >
      {running ? '생성 중…' : '맞춤 이력서 생성'}
    </Button>
  </Card>
)

export default ApplicationCard
