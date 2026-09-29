import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { openExternal } from '@/shared/lib/open-external'
import { createBillingPortal, createCheckout } from '@/features/billing'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import { Button, CanvasHeader, showToast } from '@/shared/components'
import { useBilling, PlanCard, PLAN_CARDS, PLAN_RANK } from '@/features/billing'

const isTauri = () => '__TAURI_INTERNALS__' in window

const PlanPage = () => {
  const t = useT()
  const navigate = useNavigate()
  const { data: billing } = useBilling()
  const [pending, setPending] = useState<string | null>(null)

  const plan = billing?.plan ?? 'FREE'

  const openBillingUrl = async (fn: () => Promise<string>, key: string) => {
    setPending(key)
    try {
      const url = await fn()
      if (isTauri()) {
        await openExternal(url)
      } else {
        window.location.assign(url)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('common.loadFailed'), 'circle-alert')
    } finally {
      setPending(null)
    }
  }

  return (
    <>
      <CanvasHeader
        title={t('plan.title')}
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.settings)}>
            {t('common.back')}
          </Button>
        }
      />
      <div className="canvas-body">
        <p className="plan-subtitle">{t('plan.subtitle')}</p>
        <div className="plan-grid">
          {PLAN_CARDS.map((card) => (
            <PlanCard
              key={card.id}
              card={card}
              current={plan === card.id}
              lower={PLAN_RANK[card.id] < PLAN_RANK[plan as keyof typeof PLAN_RANK]}
              pending={pending === card.id}
              portalPending={pending === 'portal'}
              onPortal={() => void openBillingUrl(createBillingPortal, card.id)}
              onCheckout={() =>
                void openBillingUrl(() => createCheckout(card.id as 'PRO' | 'ULTRA'), card.id)
              }
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default PlanPage
