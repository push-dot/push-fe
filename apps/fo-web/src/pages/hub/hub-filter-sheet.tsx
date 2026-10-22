import { CAREER_STATUSES, TENURES, type CareerStatus, type Tenure } from '@push/api-client'
import { EXPLORE_OPTIONS } from './constants'

export type HubDraft = {
  tenure?: Tenure
  status?: CareerStatus
  explore: 'recommended' | 'offers'
}

const HubFilterSheet = ({
  draft,
  total,
  onChange,
  onClose,
  onApply,
}: {
  draft: HubDraft
  total: number
  onChange: (next: HubDraft) => void
  onClose: () => void
  onApply: () => void
}) => (
  <div className="sheet-scrim" role="presentation" onClick={onClose}>
    <div className="sheet" role="dialog" aria-modal="true" aria-label="프로필 필터" onClick={(event) => event.stopPropagation()}>
      <div className="sheet-head">
        <h2 className="h3">필터</h2>
        <button type="button" className="text-link" onClick={onClose}>
          닫기
        </button>
      </div>
      <section>
        <h3 className="c1 t3">재직 기간</h3>
        <div className="sheet-chips">
          {TENURES.map((item) => (
            <button
              key={item.key}
              type="button"
              className="chip"
              aria-pressed={draft.tenure === item.key}
              onClick={() => onChange({ ...draft, tenure: draft.tenure === item.key ? undefined : item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="c1 t3">커리어 상태</h3>
        <div className="sheet-chips">
          {CAREER_STATUSES.map((item) => (
            <button
              key={item.key}
              type="button"
              className="chip"
              aria-pressed={draft.status === item.key}
              onClick={() => onChange({ ...draft, status: draft.status === item.key ? undefined : item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="c1 t3">탐색</h3>
        <div className="sheet-chips">
          {EXPLORE_OPTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="chip"
              aria-pressed={draft.explore === item.key}
              onClick={() => onChange({ ...draft, explore: item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>
      <button type="button" className="primary" onClick={onApply}>
        {`프로필 ${total}개 보기`}
      </button>
    </div>
  </div>
)

export default HubFilterSheet
