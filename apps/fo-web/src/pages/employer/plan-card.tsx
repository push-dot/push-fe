import { PLAN_SUBSCRIBE } from './constants'

const PlanCard = ({
  name,
  price,
  credits,
  blurb,
  badges,
  pending,
  onSubscribe,
}: {
  name: string
  price: string
  credits: string
  blurb: string
  badges: readonly string[]
  pending: boolean
  onSubscribe?: () => void
}) => (
  <li className="plan-card">
    {badges.length > 0 ? (
      <div className="badges">
        {badges.map((badge) => (
          <span key={badge} className="badge ac">
            {badge}
          </span>
        ))}
      </div>
    ) : null}
    <h2 className="h3">{name}</h2>
    <p className="b1 w7">{price}</p>
    <p className="b1 num">{credits}</p>
    <p className="b2 t2">{blurb}</p>
    {onSubscribe ? (
      <button type="button" className="primary" disabled={pending} onClick={onSubscribe}>
        {PLAN_SUBSCRIBE}
      </button>
    ) : null}
  </li>
)

export default PlanCard
