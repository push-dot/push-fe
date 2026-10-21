import { EMPLOYMENT_TYPES, workConditionLines } from '@push/api-client'
import { Link } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { send } from '../../shared/lib/bridge'
import { brandOf, careerLabel, dDay } from '../../shared/lib/format'
import type { PostingView } from '../../shared/api/mock'
import Toast from '../../shared/ui/toast'
import PostingActions from './posting-actions'
import { NAV } from '../../app/constants'

const longDate = (iso: string | null) => {
  if (!iso) return null
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return null
  return `${year}년 ${month}월 ${day}일`
}

const BrowserPosting = ({ posting, message, onToast }: { posting: PostingView; message: string | null; onToast: (text: string) => void }) => {
  const dday = dDay(posting.deadline)
  const duties = posting.description.split('\n').map((line) => line.trim()).filter(Boolean)
  const employment = EMPLOYMENT_TYPES.find((item) => item.key === posting.employmentType)?.label
  const conditions = workConditionLines(posting.workConditions)
  const deadline = longDate(posting.deadline)
  return (
    <main className="page browser-posting">
      <Link to="/jobs" className="back b2">
        {NAV.jobs}
      </Link>
      <div className="job-detail">
        <div className="split-sections">
          <div className="cover" style={{ background: posting.imageUrl ? undefined : brandOf(posting.company) }}>
            {posting.imageUrl ? <img src={assetUrl(posting.imageUrl)} alt="" /> : [...posting.company][0]}
          </div>
          <header className="head">
            <div className="cover-meta">
              <span className="av hd-av" style={{ background: brandOf(posting.company) }}>
                {[...posting.company][0]}
              </span>
              <span className="b1 w7">{posting.company}</span>
              {posting.industry ? <span className="badge grey">{posting.industry}</span> : null}
            </div>
            <h1 className="h1">{posting.title}</h1>
            <p className="b1 t2">
              {[posting.location, careerLabel(posting.careerMin, posting.careerMax), employment].filter(Boolean).join(' · ')}
              {dday ? (
                <>
                  {' · '}
                  <span className="red w7">{dday}</span>
                </>
              ) : null}
            </p>
          </header>
          {duties.length ? (
            <section className="section">
              <h2 className="h2">하는 일</h2>
              <ul className="b1 t2">
                {duties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {posting.requirements.length ? (
            <section className="section">
              <h2 className="h2">자격 요건</h2>
              <ul className="b1 t2">
                {posting.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {posting.preferred?.length ? (
            <section className="section">
              <h2 className="h2">우대 사항</h2>
              <ul className="b1 t2">
                {posting.preferred.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {conditions.length || deadline ? (
            <section className="section">
              <h2 className="h2">근무 조건</h2>
              <div className="card cond b1">
                {conditions.map((line) => {
                  const split = line.indexOf(' · ')
                  const label = split >= 0 ? line.slice(0, split) : line
                  const value = split >= 0 ? line.slice(split + 3) : line
                  return (
                    <span key={line} className="cond-row">
                      <span className="t3">{label}</span>
                      <span>{value}</span>
                    </span>
                  )
                })}
                {deadline ? (
                  <span className="cond-row">
                    <span className="t3">마감</span>
                    <span>{deadline}</span>
                  </span>
                ) : null}
              </div>
            </section>
          ) : null}
          {posting.sourceUrl ? (
            <a
              className="b2 w6 t2"
              href={posting.sourceUrl}
              onClick={(event) => {
                event.preventDefault()
                send({ type: 'external', url: posting.sourceUrl! })
              }}
            >
              원문 보기 · {posting.company} 채용 사이트
            </a>
          ) : null}
        </div>
        <PostingActions posting={posting} onToast={onToast} />
      </div>
      <Toast message={message} />
    </main>
  )
}

export default BrowserPosting
