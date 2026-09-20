import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { sprinkles } from '@/theme/sprinkles.css'
import { Button, CanvasHeader, Card, ErrorState, Skeleton, showToast } from '@/shared/components'
import { useCreateApplication } from '@/features/applications'
import { useJob } from '@/features/jobs'

const JobDetailPage = () => {
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
      showToast('지원을 시작했어요', 'check')
      navigate(ROUTES.applications)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '지원을 시작하지 못했어요', 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <CanvasHeader title={current ? `${current.company} — ${current.title}` : '공고 상세'} />
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
            <Card title="요구사항 분석">
              {latest ? (
                <p className="t-body-sm">
                  {`적합도 ${latest.fitScore ?? '평가 불가'} · 매칭 ${latest.matched.length}건 · 부족 ${latest.missing.length}건 (${latest.method === 'AI_ASSISTED' ? 'AI 보조' : '규칙 기반'})`}
                </p>
              ) : null}
              {current.requirements.length > 0 ? (
                <p className="t-body-sm">핵심: {current.requirements.slice(0, 3).join(', ')}</p>
              ) : null}
              {current.risks.length > 0 ? (
                <p className={['t-body-sm', sprinkles({ color: 'warn' })].join(' ')}>
                  위험: {current.risks.join(', ')}
                </p>
              ) : null}
            </Card>
            <Card title="커리어 볼트 차이">
              <p className="t-body-sm">
                {latest
                  ? `근거 ${evidenceIds.size}개 연결 가능 · 부족 요구사항 ${latest.missing.length}건`
                  : '아직 분석 결과가 없어요. 지원 준비를 시작하면 분석됩니다.'}
              </p>
            </Card>
            <Button variant="primary" size="lg" loading={busy} onClick={() => void start()}>
              지원 준비 시작
            </Button>
          </>
        ) : null}
      </div>
    </>
  )
}

export default JobDetailPage
