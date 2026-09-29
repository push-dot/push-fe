import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import {
  Button,
  CanvasHeader,
  CardGrid,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonCardGrid,
  showToast,
} from '@/shared/components'
import { ApplicationCard, useApplications, useCreateApplication, useResumeRun } from '@/features/applications'
import { useInferenceSettings } from '@/features/inference'
import { JobAddDialog } from '@/features/applications'

const ApplicationsPage = () => {
  const navigate = useNavigate()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useApplications()
  const createMutation = useCreateApplication()
  const aiOptions = useInferenceSettings((s) => s.aiOptions)
  const resumeMutation = useResumeRun()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)

  const runResume = async (appId: string) => {
    setRunningId(appId)
    try {
      const st = useInferenceSettings.getState()
      const op = await resumeMutation.mutateAsync({
        id: appId,
        ai: aiOptions(),
        byokKey: st.credentialMode === 'BYOK' ? st.byokKey : undefined,
      })
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
              <ApplicationCard
                key={a.id}
                application={a}
                running={runningId === a.id}
                onOpen={() => navigate(ROUTES.job(a.jobId))}
                onRun={() => void runResume(a.id)}
              />
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
