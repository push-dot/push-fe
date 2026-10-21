import { PLAN_NOW } from './constants'

const PlanCard = ({
  name,
  price,
  credits,
  blurb,
  features,
  current,
  action,
  pending,
  onSubscribe,
}: {
  name: string
  price: string
  credits: string
  blurb: string
  features: readonly { label: string; on: boolean }[]
  current: boolean
  action: string
  pending: boolean
  onSubscribe?: () => void
}) => (
  <li className={current ? 'plan-card now' : 'plan-card'}>
    <div className="biz-bar">
      <h2 className="h3">{name}</h2>
      {current ? <span className="badge ac">{PLAN_NOW}</span> : null}
    </div>
    <p className="b1 w7">{`${price} / 월`}</p>
    <p className="c1 t3">{`월 ${credits} 크레딧 · ${blurb}`}</p>
    <ul className="plan-features">
      {features.map((feature) => (
        <li key={feature.label} className={feature.on ? 'on' : 'off'}>
          {feature.label}
        </li>
      ))}
    </ul>
    <button type="button" className={current ? 'btn sec' : 'btn pri'} disabled={current || pending || !onSubscribe} onClick={onSubscribe}>
      {action}
    </button>
  </li>
)

export default PlanCard
