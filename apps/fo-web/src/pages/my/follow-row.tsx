import type { Profile } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { profilesUnfollow } from '../../features/follow-profile'
import { initials } from '../../shared/lib/format'
import { FOLLOWING_LABEL } from './constants'
import { followLine } from './lib'

const FollowRow = ({ profile }: { profile: Profile }) => {
  const queryClient = useQueryClient()
  const unfollow = useMutation({
    mutationFn: () => profilesUnfollow(profile.userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follows'] }),
  })
  return (
    <li className="my-row">
      <Link to={`/profiles/${profile.userId}`} className="my-row-who">
        <span className="av" style={{ background: brandColor(profile.displayName) }} aria-hidden="true">
          {initials(profile.displayName)}
        </span>
        <span className="my-row-copy">
          <span className="b1 w7 cap">{profile.displayName}</span>
          <span className="c1 t3">{followLine(profile)}</span>
        </span>
      </Link>
      <button type="button" className="btn sec sm" aria-pressed="true" disabled={unfollow.isPending} onClick={() => unfollow.mutate()}>
        {FOLLOWING_LABEL}
      </button>
    </li>
  )
}

export default FollowRow
