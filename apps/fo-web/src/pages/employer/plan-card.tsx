import { Icon } from '../../shared/ui/icon'
import { PLAN_PER_MONTH } from './constants'

const PlanCard = ({
  name,
  price,
  blurb,
  features,
  featured,
  current,
  action,
  disabled,
  onSubscribe,
}: {
  name: string
  price: string
  blurb: string
  features: readonly { label: string; on: boolean }[]
  featured: boolean
  current: boolean
  action: string
  disabled: boolean
  onSubscribe: () => void
}) => (
  <li className={featured ? 'plan-card featured' : 'plan-card'}>
    <h3 className="h2">{name}</h3>
    <p className="plan-price">
      <b className="num">{price}</b>
      <span className="b2 t3">{PLAN_PER_MONTH}</span>
    </p>
    <p className="c1 t3">{blurb}</p>
    <div className="plan-hr" />
    <ul className="plan-features">
      {features.map((feature) => (
        <li key={feature.label} className={feature.on ? 'b2 on' : 'b2 off'}>
          <Icon name={feature.on ? 'check' : 'close'} size={16} width={2.6} />
          {feature.label}
        </li>
      ))}
    </ul>
    <button type="button" className={current ? 'btn sec block now' : featured ? 'btn pri block' : 'btn sec block'} disabled={disabled || current} onClick={onSubscribe}>
      {action}
    </button>
  </li>
)

export default PlanCard
