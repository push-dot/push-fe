import { CAREER_STATUSES, JOB_CATEGORIES, type Profile } from '@push/api-client'
import { brandColor } from '@push/shared'
import { Link } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { NAV } from '../../app/constants'
import { initials } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import { careerPeriod } from './career-period'
import { profileStats } from './profile-stats'
import ProfileTools from './profile-tools'

const statusClass = (status: Profile['careerStatus']) => (status === 'seeking' ? 'green' : status === 'feedback' ? 'orange' : 'grey')

const BrowserProfile = ({ profile }: { profile: Profile }) => {
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  const category = JOB_CATEGORIES.find((item) => item.key === profile.jobCategory)?.label
  const meta = [category, profile.tenureYears != null ? `${profile.tenureYears}년` : null].filter(Boolean).join(' · ')
  const stats = profileStats(profile)
  return (
    <main className="page browser-profile">
      <Link to="/hub" className="back b2">
        <Icon name="back" size={18} width={2.2} />
        {NAV.hub}
      </Link>
      <div className="profile-layout">
        <div className="pf-main">
          <header className="pf-head">
            {profile.avatarUrl ? (
              <img className="av" src={assetUrl(profile.avatarUrl)} alt="" />
            ) : (
              <span className="av" style={{ background: brandColor(profile.displayName) }}>
                {initials(profile.displayName)}
              </span>
            )}
            <div className="pf-id">
              <div className="pf-name">
                <h1 className="h1">{profile.displayName}</h1>
                {status ? <span className={`badge ${statusClass(profile.careerStatus)}`}>{status}</span> : null}
              </div>
              <span className="b1 t2">{profile.headline}</span>
              {meta ? <span className="c1 t3">{meta}</span> : null}
              {stats.length ? <span className="c1 t3">{stats.map((stat) => `${stat.value} ${stat.label}`).join(' · ')}</span> : null}
            </div>
          </header>
          {profile.intro ? (
            <section className="pf-block">
              <h2 className="h2">소개</h2>
              <p className="b1 t2">{profile.intro}</p>
            </section>
          ) : null}
          {profile.careers.length ? (
            <section className="pf-block career">
              <h2 className="h2">경력</h2>
              <div>
                {profile.careers.map((career) => (
                  <div className="tl-row" key={`${career.company}-${career.startedOn}`}>
                    <span className="tl-rail">
                      <span className="tl-dot now" />
                      <span className="tl-line" />
                    </span>
                    <span className="tl-body">
                      <span className="b1 w7">{`${career.company} · ${career.role}`}</span>
                      <span className="c1 t3">{careerPeriod(career)}</span>
                      {career.description ? <span className="b2 t2 tl-desc">{career.description}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {profile.skills.length ? (
            <section className="pf-block">
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
