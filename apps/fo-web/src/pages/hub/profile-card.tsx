import { CAREER_STATUSES, JOB_CATEGORIES, type Profile } from '@push/api-client'
import { brandColor } from '@push/shared'
import { Link } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { initials } from '../../shared/lib/format'

const ProfileCard = ({ profile }: { profile: Profile }) => {
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  const tone = profile.careerStatus === 'seeking' ? 'green' : profile.careerStatus === 'feedback' ? 'orange' : 'grey'
  const category = JOB_CATEGORIES.find((item) => item.key === profile.jobCategory)?.label
  const meta = [category, profile.tenureYears != null ? `${profile.tenureYears}년` : null].filter(Boolean).join(' · ')
  return (
    <Link to={`/profiles/${profile.userId}`} className="hub-card">
      <span className="hub-top">
        {profile.avatarUrl ? (
          <img className="hub-av" src={assetUrl(profile.avatarUrl)} alt="" />
        ) : (
          <span className="hub-av" style={{ background: brandColor(profile.displayName) }}>
            {initials(profile.displayName)}
          </span>
        )}
        <span className="hub-id">
          <span className="b1 w7">{profile.displayName}</span>
          <span className="c1 t3">{meta}</span>
        </span>
        {status ? <span className={`badge ${tone}`}>{status}</span> : null}
      </span>
      <span className="b2 t2 hub-line">{profile.headline}</span>
    </Link>
  )
}

export default ProfileCard
