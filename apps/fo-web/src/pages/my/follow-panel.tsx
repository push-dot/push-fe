import { Link } from 'react-router-dom'

import { useFollows } from '../../entities/profile'
import { LOAD_FAIL } from '../../shared/ui/page-state'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import { ACTIVITY_LOAD_ERROR, FOLLOW_EMPTY, FOLLOW_EMPTY_ACTION, FOLLOW_EMPTY_SUB, followCount, listTotal } from './constants'
import FollowRow from './follow-row'

const FollowPanel = () => {
  const query = useFollows()
  if (query.isLoading) return <Skeleton rows={4} />
  if (query.isError || !query.data) return <ErrorState boxed title={ACTIVITY_LOAD_ERROR} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} />
  if (query.data.data.length === 0) {
    return (
      <StateBlock
        boxed
        icon="people"
        title={FOLLOW_EMPTY}
        description={FOLLOW_EMPTY_SUB}
        action={
          <Link to="/hub" className="btn pri sm">
            {FOLLOW_EMPTY_ACTION}
          </Link>
        }
      />
    )
  }
  return (
    <>
      <p className="b2 t3 my-count">{followCount(listTotal(query.data))}</p>
      <ul className="box my-rows">
        {query.data.data.map((profile) => (
          <FollowRow key={profile.userId} profile={profile} />
        ))}
      </ul>
    </>
  )
}

export default FollowPanel
