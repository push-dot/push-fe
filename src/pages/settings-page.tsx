import { useT } from '@/shared/i18n'
import { CanvasHeader, ErrorState, Form, SkeletonRows } from '@/shared/components'
import { useAiModels } from '@/features/inference'
import { AccountSection } from '@/features/auth'
import { CredentialSection } from '@/features/inference'
import { PlanSection } from '@/features/billing'
import { AppearanceSection } from '@/features/settings'
import { useMe } from '@/features/auth'
import { useBilling } from '@/features/billing'

const SettingsPage = () => {
  const t = useT()
  const meQuery = useMe()
  const billingQuery = useBilling()
  const modelsQuery = useAiModels()
  const me = meQuery.data ?? null
  const models = modelsQuery.data ?? []
  const status: 'loading' | 'error' | 'success' =
    meQuery.isPending || billingQuery.isPending || modelsQuery.isPending
      ? 'loading'
      : meQuery.isError || billingQuery.isError || modelsQuery.isError
        ? 'error'
        : 'success'
  const error =
    meQuery.error?.message ?? billingQuery.error?.message ?? modelsQuery.error?.message ?? null

  const load = async () => {
    await Promise.all([meQuery.refetch(), billingQuery.refetch(), modelsQuery.refetch()])
  }

  const modelLabel = models.find((m) => m.available)?.label ?? '—'

  return (
    <>
      <CanvasHeader title={t('nav.settings')} />
      <div className="canvas-body">
        {status === 'loading' ? <SkeletonRows count={6} height={40} /> : null}
        {status === 'error' ? (
          <ErrorState message={error ?? undefined} onRetry={() => void load()} />
        ) : null}
        {status === 'success' ? (
          <Form>
            <AccountSection me={me} />
            <CredentialSection modelLabel={modelLabel} />
            <PlanSection />
            <AppearanceSection />
          </Form>
        ) : null}
      </div>
    </>
  )
}

export default SettingsPage
