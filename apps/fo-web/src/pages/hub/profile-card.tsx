import { CAREER_STATUSES, type Profile } from '@push/api-client'
import { Link } from 'react-router-dom'
import { assetUrl } from '../../api'
import { brandOf, initials, roleLabel } from '../../format'

const ProfileCard = ({ profile }: { profile: Profile }) => {
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  return (
    <Link to={`/profiles/${profile.userId}`} className="hub-card">
      {profile.avatarUrl ? (
        <img className="hub-av" src={assetUrl(profile.avatarUrl)} alt="" />
      ) : (
        <span className="hub-av" style={{ background: brandOf(profile.displayName) }}>
          {initials(profile.displayName)}
        </span>
      )}
      <span className="hub-copy">
        <span className="hub-name">
          <span className="b1 w7">{profile.displayName}</span>
          {status ? <span className={`badge ${profile.careerStatus === 'seeking' ? 'ac' : 'grey'}`}>{status}</span> : null}
        </span>
        <span className="b2 t2">{profile.headline}</span>
        <span className="c1 t3">{roleLabel(profile.jobCategory, profile.tenureYears)}</span>
      </span>
    </Link>
  )
}

export default ProfileCard
