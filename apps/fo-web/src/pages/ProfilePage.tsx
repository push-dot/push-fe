import { CAREER_STATUSES } from '@push/api-client'
import { useParams } from 'react-router-dom'
import { api, assetUrl } from '../api'
import { brandOf, initials, periodLabel, roleLabel } from '../format'
import { useDetail } from '../useDetail'
import { Status } from './Section'

export function ProfilePage() {
  const { id = '' } = useParams()
  const { data: p, error } = useDetail(['profile', id], () => api.profiles.get(id), (p) => p.displayName)
  if (!p) return <Status error={!!error} what="프로필" />
  const status = CAREER_STATUSES.find((s) => s.key === p.careerStatus)?.label
  return (
    <main className="page profile">
      <header className="profile-head">
        {p.avatarUrl ? (
          <img className="av" src={assetUrl(p.avatarUrl)} alt="" />
        ) : (
          <div className="av" style={{ background: brandOf(p.displayName) }} aria-hidden="true">
            {initials(p.displayName)}
          </div>
        )}
        <h1 className="h1">{p.displayName}</h1>
        <span className="b2 t2">{p.headline}</span>
        <span className="badges">
          {p.jobCategory || p.tenureYears != null ? <span className="badge grey">{roleLabel(p.jobCategory, p.tenureYears)}</span> : null}
          {status ? <span className={`badge ${p.careerStatus === 'seeking' ? 'ac' : 'grey'}`}>{status}</span> : null}
        </span>
      </header>
      {p.intro ? (
        <section className="section">
          <h2 className="h3">소개</h2>
          <p className="b2 t2">{p.intro}</p>
        </section>
      ) : null}
      {p.careers.length ? (
        <section className="section timeline">
          <h2 className="h3">경력</h2>
          {p.careers.map((c, i) => (
            <div className="tl-row" key={`${c.company}-${c.startedOn}`}>
              <span className="tl-rail">
                <span className={c.endedOn ? 'tl-dot' : 'tl-dot now'} />
                {i < p.careers.length - 1 ? <span className="tl-line" /> : null}
              </span>
              <span className="tl-body">
                <span className="b1 w7">
                  {c.company} · {c.role}
                </span>
                <span className="c1 t3">{periodLabel(c)}</span>
                {c.description ? <span className="b2 t2 tl-desc">{c.description}</span> : null}
              </span>
            </div>
          ))}
        </section>
      ) : null}
      {p.skills.length ? (
        <section className="section">
          <h2 className="h3">기술 스택</h2>
          <div className="badges">
            {p.skills.map((s) => (
              <span className="badge grey" key={s}>
                {s}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
