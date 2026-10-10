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
import {
  ApplicationCard,
  useApplications,
  useCreateApplication,
  useResumeRun,
} from '@/features/applications'
import { useInferenceSettings } from '@/features/inference'
import { JobAddDialog } from '@/features/applications'
import { useT } from '@/shared/i18n'

const ApplicationsPage = () => {
  const t = useT()
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
      showToast(t('applications.resumeCreated'), 'check')
      if (docId) navigate(ROUTES.document(docId))
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('applications.resumeFailed'), 'circle-alert')
    } finally {
      setRunningId(null)
    }
  }

  return (
    <>
      <CanvasHeader
        title={t('nav.applications')}
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> {t('jobs.addTitle')}
          </Button>
        }
      />
      <div className="canvas-body">
        {isPending ? <SkeletonCardGrid count={3} /> : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? (
          <EmptyState
            message={t('applications.empty')}
            actionLabel={t('jobs.addTitle')}
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
      {dialogOpen ? (
        <JobAddDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={(job) => {
            void createMutation
              .mutateAsync(job.id)
              .then(() => showToast(t('jobs.applicationAdded'), 'check'))
              .catch((e: unknown) =>
                showToast(
                  e instanceof Error ? e.message : t('jobs.applicationFailed'),
                  'circle-alert',
                ),
              )
          }}
        />
      ) : null}
    </>
  )
}

export default ApplicationsPage
