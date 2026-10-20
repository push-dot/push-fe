import { useT } from '@/shared/i18n'
import { Button, Icon } from '@/shared/components'
import type { PlanCardDef } from '../types'

type PlanCardProps = {
  card: PlanCardDef
  current: boolean
  lower: boolean
  pending: boolean
  portalPending: boolean
  onPortal: () => void
  onCheckout: () => void
}

const PlanCard = ({
  card,
  current,
  lower,
  pending,
  portalPending,
  onPortal,
  onCheckout,
}: PlanCardProps) => {
  const t = useT()
  return (
    <div className={card.id === 'ULTRA' ? 'plan-card is-featured' : 'plan-card'}>
      <div className="plan-card-head">
        <span className="plan-card-name">
          {card.id === 'FREE' ? 'Free' : t(card.nameKey)}
        </span>
        {current ? <span className="plan-card-badge">{t('plan.current')}</span> : null}
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
      {card.id === 'FREE' ? null : current ? (
        <Button variant="secondary" size="md" loading={portalPending} onClick={onPortal}>
          {t('settings.manageBilling')}
        </Button>
      ) : lower ? (
        <Button variant="secondary" size="md" loading={pending} onClick={onPortal}>
          {t('plan.downgrade')}
        </Button>
      ) : (
        <Button
          variant={card.id === 'ULTRA' ? 'primary' : 'secondary'}
          size="md"
          loading={pending}
          onClick={onCheckout}
        >
          {t('settings.upgrade')}
        </Button>
      )}
    </div>
  )
}

export default PlanCard
