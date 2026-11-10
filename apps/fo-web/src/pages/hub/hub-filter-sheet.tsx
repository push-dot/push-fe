import {
  CAREER_STATUSES,
  TENURES,
  type CareerStatus,
  type JobCategory,
  type Tenure,
} from '@push/api-client'

import { Popover } from '../../shared/ui/popover'
import { HUB_STATUS_ORDER } from './constants'

const STATUSES = [...CAREER_STATUSES].sort(
  (a, b) => HUB_STATUS_ORDER.indexOf(a.key) - HUB_STATUS_ORDER.indexOf(b.key),
)

export type HubDraft = {
  tenure?: Tenure
  status?: CareerStatus
}

export const countApplied = (draft: HubDraft) => (draft.tenure ? 1 : 0) + (draft.status ? 1 : 0)

export const profileFilters = (categories: JobCategory[], draft: HubDraft) => ({
  category: categories.length > 0 ? categories : undefined,
  tenure: draft.tenure ? [draft.tenure] : undefined,
  status: draft.status ? [draft.status] : undefined,
})

const HubFilterSheet = ({
  draft,
  onChange,
  onClose,
  onApply,
}: {
  draft: HubDraft
  onChange: (next: HubDraft) => void
  onClose: () => void
  onApply: () => void
}) => {
  const count = countApplied(draft)
  return (
    <Popover label="프로필 필터" onClose={onClose} className="hub-pop">
      <div className="hub-pop-head">
        <h2 className="h3">필터</h2>
        {count > 0 ? <span className="c1 t3 w6">{`${count}개 적용 중`}</span> : null}
      </div>
      <section className="hub-pop-group">
        <h3 className="b2 w7">경력</h3>
        <div className="hub-pop-chips">
          {TENURES.map((item) => (
            <button
              key={item.key}
              type="button"
              className="chip"
              aria-pressed={draft.tenure === item.key}
              onClick={() =>
                onChange({ ...draft, tenure: draft.tenure === item.key ? undefined : item.key })
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section className="hub-pop-group">
        <h3 className="b2 w7">상태</h3>
        <div className="hub-pop-chips">
          {STATUSES.map((item) => (
            <button
              key={item.key}
              type="button"
              className="chip"
              aria-pressed={draft.status === item.key}
              onClick={() =>
                onChange({ ...draft, status: draft.status === item.key ? undefined : item.key })
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <div className="hr" />
      <div className="hub-pop-foot">
        <button type="button" className="btn sec sm" onClick={() => onChange({})}>
          초기화
        </button>
        <button type="button" className="btn pri sm" onClick={onApply}>
          적용
        </button>
      </div>
    </Popover>
  )
}

export default HubFilterSheet
