import { CAREER_STATUSES, JOB_CATEGORIES, type Profile } from '@push/api-client'
import { Link } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { NAV } from '../../app/constants'
import { brandOf, initials, periodLabel } from '../../shared/lib/format'
import ProfileTools from './profile-tools'

const statusClass = (status: Profile['careerStatus']) => (status === 'seeking' ? 'green' : status === 'feedback' ? 'orange' : 'grey')

const BrowserProfile = ({ profile }: { profile: Profile }) => {
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  const category = JOB_CATEGORIES.find((item) => item.key === profile.jobCategory)?.label
  return (
    <main className="page browser-profile">
      <Link to="/hub" className="back b2">
        {NAV.hub}
      </Link>
      <div className="profile-layout">
        <div className="split-sections">
          <header className="preview-head">
            {profile.avatarUrl ? (
              <img className="av" src={assetUrl(profile.avatarUrl)} alt="" />
            ) : (
              <span className="av" style={{ background: brandOf(profile.displayName) }}>
                {initials(profile.displayName)}
              </span>
            )}
            <span>
              <span className="h2">
                {profile.displayName}
                {status ? <span className={`badge ${statusClass(profile.careerStatus)}`}>{status}</span> : null}
              </span>
              <span className="b1 t2">{profile.headline}</span>
              <span className="c1 t3">
                {[category, profile.tenureYears != null ? `${profile.tenureYears}년` : null, `팔로워 ${profile.followerCount}`].filter(Boolean).join(' · ')}
              </span>
            </span>
          </header>
          {profile.intro ? (
            <section className="profile-block">
              <h2 className="h2">소개</h2>
              <p className="b1 t2">{profile.intro}</p>
            </section>
          ) : null}
          {profile.careers.length ? (
            <section className="profile-block">
              <h2 className="h2">경력</h2>
              {profile.careers.map((career, index) => (
                <div className="tl-row" key={`${career.company}-${career.startedOn}`}>
                  <span className="tl-rail">
                    <span className={career.endedOn ? 'tl-dot' : 'tl-dot now'} />
                    {index < profile.careers.length - 1 ? <span className="tl-line" /> : null}
                  </span>
                  <span className="tl-body">
                    <span className="b1 w7">
                      {career.company} · {career.role}
                    </span>
                    <span className="c1 t3">{periodLabel(career)}</span>
                    {career.description ? <span className="b2 t2 tl-desc">{career.description}</span> : null}
                  </span>
                </div>
              ))}
            </section>
          ) : null}
          {profile.skills.length ? (
            <section className="profile-block">
              <h2 className="h2">기술 스택</h2>
              <div className="skill-row">
                {profile.skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <ProfileTools profile={profile} />
      </div>
    </main>
  )
}

export default BrowserProfile
