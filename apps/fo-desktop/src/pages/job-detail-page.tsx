import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { sprinkles } from '@push/design-system'
import { Button, CanvasHeader, Card, ErrorState, Skeleton, showToast } from '@/shared/components'
import { useCreateApplication } from '@/features/applications'
import { useJob } from '@/features/applications'
import { useT } from '@/shared/i18n'

const JobDetailPage = () => {
  const t = useT()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isPending, isError, isSuccess, error, refetch } = useJob(id)
  const current = data?.job ?? null
  const analyses = data?.analyses ?? []
  const createApplication = useCreateApplication()
  const [busy, setBusy] = useState(false)

  const latest = analyses[0] ?? null
  const evidenceIds = new Set(latest?.matched.flatMap((m) => m.evidenceIds) ?? [])

  const start = async () => {
    setBusy(true)
    try {
      await createApplication.mutateAsync(id)
      showToast(t('jobs.started'), 'check')
      navigate(ROUTES.applications)
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('jobs.startFailed'), 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <CanvasHeader title={current ? `${current.company} — ${current.title}` : t('jobs.detail')} />
      <div className="canvas-body">
        {isPending ? (
          <>
            <Skeleton height={96} />
            <Skeleton height={96} />
            <Skeleton height={96} />
          </>
        ) : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && current ? (
          <>
            <Card title={t('jobs.analysis')}>
              {latest ? (
                <p className="t-body-sm">
                  {t('jobs.fitSummary', {
                    score: latest.fitScore ?? t('jobs.fitUnscored'),
                    matched: latest.matched.length,
                    missing: latest.missing.length,
                    method:
                      latest.method === 'AI_ASSISTED' ? t('jobs.methodAi') : t('jobs.methodRule'),
                  })}
                </p>
              ) : null}
              {current.requirements.length > 0 ? (
                <p className="t-body-sm">
                  {t('jobs.core', { items: current.requirements.slice(0, 3).join(', ') })}
                </p>
              ) : null}
              {current.risks.length > 0 ? (
                <p className={['t-body-sm', sprinkles({ color: 'warn' })].join(' ')}>
                  {t('jobs.risks', { items: current.risks.join(', ') })}
                </p>
              ) : null}
            </Card>
            <Card title={t('jobs.vaultDiff')}>
              <p className="t-body-sm">
                {latest
                  ? t('jobs.evidenceLinkable', {
                      count: evidenceIds.size,
                      missing: latest.missing.length,
                    })
                  : t('jobs.noAnalysis')}
              </p>
            </Card>
            <Button variant="primary" size="lg" loading={busy} onClick={() => void start()}>
              {t('jobs.startPrep')}
            </Button>
          </>
        ) : null}
      </div>
    </>
  )
}

export default JobDetailPage
