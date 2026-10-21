import { EMPLOYMENT_TYPES, workConditionLines } from '@push/api-client'
import { useParams } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { isWebView, send } from '../../shared/lib/bridge'
import { brandOf, careerLabel, dDay } from '../../shared/lib/format'
import type { PostingView } from '../../shared/api/mock'
import { showFitCard } from '../../shared/model/fit-card'
import Toast, { useToast } from '../../shared/ui/toast'
import { useDetail } from '../../shared/lib/use-detail'
import FitCard from './fit-card'
import BrowserPosting from './browser-posting'
import PostingActions from './posting-actions'
import Section from '../../shared/ui/section'
import Status from '../../shared/ui/status'
import { postingsGet } from '../../shared/api/operations'


const PostingPage = () => {
  const { id = '' } = useParams()
  const toast = useToast()
  const { data: p, error } = useDetail(['posting', id], () => postingsGet(id) as Promise<PostingView>, (item) => item.company)
  if (!p) return <Status error={!!error} what="공고" />
  if (!isWebView()) return <BrowserPosting posting={p} message={toast.message} onToast={toast.show} />
  const dday = dDay(p.deadline)
  const duties = p.description.split('\n').map((s) => s.trim()).filter(Boolean)
  return (
    <main className="page">
      <PostingActions posting={p} onToast={toast.show} />
      <header className="head">
        <div className="company">
          {p.imageUrl ? (
            <img className="logo" src={assetUrl(p.imageUrl)} alt="" />
          ) : (
            <div className="logo" style={{ background: brandOf(p.company) }} aria-hidden="true">
              {[...p.company][0]}
            </div>
          )}
          <span className="b2 w7">{p.company}</span>
          {p.industry ? <span className="c1 t3">{p.industry}</span> : null}
        </div>
        <h1 className="h1">{p.title}</h1>
        <div className="badges">
          {dday ? <span className="badge red">{dday}</span> : null}
          <span className="badge grey">{p.location}</span>
          <span className="badge grey">{careerLabel(p.careerMin, p.careerMax)}</span>
          <span className="badge grey">{EMPLOYMENT_TYPES.find((t) => t.key === p.employmentType)?.label}</span>
        </div>
      </header>
      {showFitCard(isWebView()) ? <FitCard postingId={p.id} /> : null}
      <Section title="하는 일" items={duties} />
      <Section title="자격 요건" items={p.requirements} />
      <Section title="우대 사항" items={p.preferred ?? []} />
      <Section title="근무 조건" items={workConditionLines(p.workConditions)} />
      {p.sourceUrl ? (
        <a
          className="c1 w6 source"
          href={p.sourceUrl}
          onClick={(e) => {
            e.preventDefault()
            send({ type: 'external', url: p.sourceUrl! })
          }}
        >
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
          원문 보기 · {p.company} 채용 사이트
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
          </svg>
        </a>
      ) : null}
      <Toast message={toast.message} />
    </main>
  )
}

export default PostingPage
