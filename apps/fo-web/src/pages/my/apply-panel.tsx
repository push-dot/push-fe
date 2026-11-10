import { stageBadge } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useState } from 'react'

import { useApplications } from '../../entities/application'
import { LOAD_FAIL } from '../../shared/ui/page-state'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import { ACTIVITY_LOAD_ERROR, APPLICATION_EMPTY, APPLY_FILTERS, APPLY_HEAD, FIT_NOTE } from './constants'
import { applyCounts, appliedLine, filterApplications, stageTone, type ApplyFilter } from './lib'

const ApplyPanel = () => {
  const query = useApplications()
  const [filter, setFilter] = useState<ApplyFilter>('all')
  if (query.isLoading) return <Skeleton rows={4} />
  if (query.isError || !query.data) return <ErrorState boxed title={ACTIVITY_LOAD_ERROR} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} />
  const items = query.data.data
  if (items.length === 0) return <StateBlock boxed icon="brief" title={APPLICATION_EMPTY} />
  const counts = applyCounts(items)
  return (
    <>
      <div className="my-apply-chips" role="group" aria-label={APPLY_HEAD.stage}>
        {APPLY_FILTERS.map((item) => (
          <button key={item.key} type="button" className="chip" aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>
            {`${item.label} ${counts[item.key]}`}
          </button>
        ))}
      </div>
      <div className="box my-apply-table" role="table">
        <div className="my-apply-head c1 w7 t3" role="row">
          <span className="my-apply-tile" />
          <span className="my-apply-title" role="columnheader">{APPLY_HEAD.posting}</span>
          <span className="my-apply-fit" role="columnheader">{APPLY_HEAD.fit}</span>
          <span className="my-apply-stage" role="columnheader">{APPLY_HEAD.stage}</span>
        </div>
        {filterApplications(items, filter).map((item) => (
          <div key={item.id} className="my-apply-row" role="row">
            <span className="my-apply-tile av" style={{ background: brandColor(item.company) }} aria-hidden="true">
              {[...item.company][0]}
            </span>
            <span className="my-apply-title" role="cell">
              <span className="b1 w7 cap">{item.title}</span>
              <span className="c1 t3">{appliedLine(item)}</span>
            </span>
            {typeof item.fitScore === 'number' ? (
              <span className="my-apply-fit b2 num" role="cell">
                <span className="c1 t3">{APPLY_HEAD.fit}</span>
                <b className="w8">{item.fitScore}</b>
              </span>
            ) : (
              <span className="my-apply-fit b2 t4" role="cell">
                <span className="my-apply-fit-lb c1 t3">{APPLY_HEAD.fit}</span>–
              </span>
            )}
            <span className={`my-apply-stage badge ${stageTone(item.stage)}`} role="cell">
              {stageBadge(item.stage)}
            </span>
          </div>
        ))}
      </div>
      <p className="c1 t3">{FIT_NOTE}</p>
    </>
  )
}

export default ApplyPanel
