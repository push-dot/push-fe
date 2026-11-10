import { CAREER_STATUSES, type Profile } from '@push/api-client'
import { assetUrl } from '../../shared/api/client'
import { roleLabel } from '../../shared/lib/format'
import { PROFILE_EDIT, PROFILE_EDIT_BASIC, PROFILE_SECTIONS, PROFILE_STATS } from './constants'
import { careerSpan, statusTone } from './my-rules'
import EditButton from './edit-button'
import ProfileAvatar from './profile-avatar'

const ProfileView = ({ profile, onEdit }: { profile: Profile; onEdit: () => void }) => {
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  const role = roleLabel(profile.jobCategory, profile.tenureYears)
  return (
    <div className="mp">
      <p className="c1 t3 mp-sub">
        {PROFILE_STATS({
          following: profile.followingCount ?? 0,
          followers: profile.followerCount,
          posts: profile.postCount ?? 0,
        })}
      </p>
      <div className="mp-body">
        <div className="mp-head">
          <ProfileAvatar name={profile.displayName} src={assetUrl(profile.avatarUrl)} />
          <span className="mp-head-copy">
            <span className="mp-name">
              <span className="h1">{profile.displayName}</span>
              {status ? (
                <span className={`badge ${statusTone(profile.careerStatus)}`}>{status}</span>
              ) : null}
            </span>
            {profile.headline ? <span className="b1 t2">{profile.headline}</span> : null}
            {role ? <span className="c1 t3">{role}</span> : null}
          </span>
          <span className="mp-head-edit">
            <EditButton label={PROFILE_EDIT_BASIC} onClick={onEdit} />
          </span>
        </div>
        <section>
          <div className="mp-sect-head">
            <h2 className="h2">{PROFILE_SECTIONS.intro}</h2>
            <EditButton label={PROFILE_EDIT} onClick={onEdit} />
          </div>
          <p className="b1 t2 mp-intro">{profile.intro}</p>
        </section>
        <section>
          <div className="mp-sect-head wide">
            <h2 className="h2">{PROFILE_SECTIONS.careers}</h2>
            <EditButton label={PROFILE_EDIT} onClick={onEdit} />
          </div>
          {profile.careers.map((career) => (
            <div className="mp-tl" key={`${career.company}-${career.startedOn}`}>
              <span className="mp-tl-rail">
                <i className="mp-tl-dot" />
                <i className="mp-tl-line" />
              </span>
              <span className="mp-tl-copy">
                <span className="b1 w7">{`${career.company} · ${career.role}`}</span>
                <span className="c1 t3">{careerSpan(career)}</span>
                {career.description ? (
                  <span className="b2 t2 mp-tl-desc">{career.description}</span>
                ) : null}
              </span>
            </div>
          ))}
        </section>
        <section>
          <div className="mp-sect-head">
            <h2 className="h2">{PROFILE_SECTIONS.skills}</h2>
            <EditButton label={PROFILE_EDIT} onClick={onEdit} />
          </div>
          <div className="skill-row">
            {profile.skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProfileView
