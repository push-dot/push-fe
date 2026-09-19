import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import {
  Button,
  CanvasHeader,
  Card,
  CardGrid,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonCardGrid,
  StatusChip,
  showToast,
} from '@/shared/components'
import { stageChipTone, useApplications, useCreateApplication } from '@/features/applications'
import { resumeRun } from '@/features/applications'
import { useInferenceSettings } from '@/features/inference'
import { JobAddDialog } from '@/features/jobs'

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

const ApplicationsPage = () => {
  const navigate = useNavigate()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useApplications()
  const createMutation = useCreateApplication()
  const aiOptions = useInferenceSettings((s) => s.aiOptions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)

  const runResume = async (appId: string) => {
    setRunningId(appId)
    try {
      const st = useInferenceSettings.getState()
      const op = await resumeRun(
        appId,
        aiOptions(),
        st.credentialMode === 'BYOK' ? st.byokKey : undefined,
      )
      const docId = (op.result as { document?: { id?: string } })?.document?.id
      showToast('맞춤 이력서를 만들었어요', 'check')
      if (docId) navigate(ROUTES.document(docId))
    } catch (e) {
      showToast(e instanceof Error ? e.message : '이력서 생성에 실패했어요', 'circle-alert')
    } finally {
      setRunningId(null)
    }
  }

  return (
    <>
      <CanvasHeader
        title="지원 관리"
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> 공고 추가
          </Button>
        }
      />
      <div className="canvas-body">
        {isPending ? <SkeletonCardGrid count={3} /> : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? (
          <EmptyState
            message="아직 지원 내역이 없어요"
            actionLabel="공고 추가"
            onAction={() => setDialogOpen(true)}
          />
        ) : null}
        {isSuccess && items.length > 0 ? (
          <CardGrid>
            {items.map((a) => (
              <Card
                key={a.id}
                title={`${a.company} ${a.title}`}
                meta={STAGE_META[a.stage]}
                onClick={() => navigate(ROUTES.job(a.jobId))}
              >
                <StatusChip tone={stageChipTone(a.stage)} label={a.stage} />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={runningId === a.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    void runResume(a.id)
                  }}
                >
                  {runningId === a.id ? '생성 중…' : '맞춤 이력서 생성'}
                </Button>
              </Card>
            ))}
          </CardGrid>
        ) : null}
      </div>
      <JobAddDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={(job) => {
          void createMutation
            .mutateAsync(job.id)
            .then(() => showToast('지원을 추가했어요', 'check'))
            .catch((e: unknown) =>
              showToast(e instanceof Error ? e.message : '지원을 만들지 못했어요', 'circle-alert'),
            )
        }}
      />
    </>
  )
}

export default ApplicationsPage
