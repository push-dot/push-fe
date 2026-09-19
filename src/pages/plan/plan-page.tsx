import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { openUrl } from '@tauri-apps/plugin-opener'
import { createBillingPortal, createCheckout } from '@/features/billing'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import { Button, CanvasHeader, Icon, showToast } from '@/shared/components'
import { useBilling } from '@/features/billing'

const isTauri = () => '__TAURI_INTERNALS__' in window

type PlanCard = {
  id: 'FREE' | 'PRO' | 'ULTRA'
  nameKey: MsgKey
  priceKey: MsgKey | null
  featureKeys: MsgKey[]
}

const PLAN_CARDS: PlanCard[] = [
  {
    id: 'FREE',
    nameKey: 'plan.current',
    priceKey: null,
    featureKeys: ['plan.freeFeat1', 'plan.freeFeat2'],
  },
  {
    id: 'PRO',
    nameKey: 'plan.proName',
    priceKey: 'plan.proPrice',
    featureKeys: ['plan.proFeat1', 'plan.proFeat2', 'plan.proFeat3'],
  },
  {
    id: 'ULTRA',
    nameKey: 'plan.ultraName',
    priceKey: 'plan.ultraPrice',
    featureKeys: ['plan.ultraFeat1', 'plan.ultraFeat2', 'plan.ultraFeat3'],
  },
]

const PlanPage = () => {
  const t = useT()
  const navigate = useNavigate()
  const { data: billing } = useBilling()
  const [pending, setPending] = useState<string | null>(null)


  const plan = billing?.plan ?? 'FREE'
  const rank = { FREE: 0, PRO: 1, ULTRA: 2 } as const

  const openBillingUrl = async (fn: () => Promise<string>, key: string) => {
    setPending(key)
    try {
      const url = await fn()
      if (isTauri()) {
        await openUrl(url)
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
          {PLAN_CARDS.map((card) => {
            const isCurrent = plan === card.id
            return (
              <div
                key={card.id}
                className={card.id === 'ULTRA' ? 'plan-card is-featured' : 'plan-card'}
              >
                <div className="plan-card-head">
                  <span className="plan-card-name">
                    {card.id === 'FREE' ? 'Free' : t(card.nameKey)}
                  </span>
                  {isCurrent ? (
                    <span className="plan-card-badge">{t('plan.current')}</span>
                  ) : null}
                </div>
                <div className="plan-card-price">
                  {card.priceKey ? (
                    <>
                      <span className="plan-card-amount">{t(card.priceKey)}</span>
                      <span className="plan-card-cycle">{t('plan.perMonth')}</span>
                    </>
                  ) : (
                    <span className="plan-card-amount">$0</span>
                  )}
                </div>
                <ul className="plan-card-features">
                  {card.featureKeys.map((k) => (
                    <li key={k}>
                      <Icon name="check" size={16} />
                      {t(k)}
                    </li>
                  ))}
                </ul>
                {card.id === 'FREE' ? null : isCurrent ? (
                  <Button
                    variant="secondary"
                    size="md"
                    loading={pending === 'portal'}
                    onClick={() => void openBillingUrl(createBillingPortal, 'portal')}
                  >
                    {t('settings.manageBilling')}
                  </Button>
                ) : rank[card.id] < rank[plan as keyof typeof rank] ? (
                  <Button
                    variant="secondary"
                    size="md"
                    loading={pending === card.id}
                    onClick={() => void openBillingUrl(createBillingPortal, card.id)}
                  >
                    {t('plan.downgrade')}
                  </Button>
                ) : (
                  <Button
                    variant={card.id === 'ULTRA' ? 'primary' : 'secondary'}
                    size="md"
                    loading={pending === card.id}
                    onClick={() => void openBillingUrl(() => createCheckout(card.id as 'PRO' | 'ULTRA'), card.id)}
                  >
                    {t('settings.upgrade')}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default PlanPage
