import {
  PLAN_BUY,
  PLAN_BUY_HINT,
  PLAN_BUY_TITLE,
  PLAN_HISTORY,
  PLAN_USAGE_RESET,
  PLAN_USAGE_TITLE,
  planUsed,
} from './constants'

// buy: 'on' for an admin while payments are open, 'off' for a member (board WebBizPlanViewer), 'hidden' while payments are closed.
const PlanUsage = ({ percent, buy, onHistory, onBuy }: { percent: number; buy: 'on' | 'off' | 'hidden'; onHistory: () => void; onBuy: () => void }) => (
  <section className="box plan-usage">
    <div className="plan-usage-head">
      <h2 className="b1 w7">{PLAN_USAGE_TITLE}</h2>
      <span className="b2 t3">{planUsed(percent)}</span>
    </div>
    <span className="plan-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={PLAN_USAGE_TITLE}>
      <i style={{ width: `${percent}%` }} />
    </span>
    <p className="c1 t3">{PLAN_USAGE_RESET}</p>
    <div className="plan-hr" />
    <div className="plan-buy">
      <div className="plan-buy-copy">
        <h2 className="b1 w7">{PLAN_BUY_TITLE}</h2>
        <p className="c1 t3">{PLAN_BUY_HINT}</p>
      </div>
      <div className="plan-buy-actions">
        <button type="button" className="btn sec sm" onClick={onHistory}>
          {PLAN_HISTORY}
        </button>
        {buy === 'hidden' ? null : (
          <button type="button" className="btn pri sm" disabled={buy === 'off'} onClick={onBuy}>
            {PLAN_BUY}
          </button>
        )}
      </div>
    </div>
  </section>
)

export default PlanUsage
