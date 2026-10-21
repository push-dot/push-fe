import { Link } from 'react-router-dom'
import type { PostingDraft } from '../../shared/model/employer-chat'
import { DRAFT_BADGE, DRAFT_POSTING } from './constants'
import { textFromConditions } from './posting-draft'

const lines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean)

const ChatDraftCard = ({ draft }: { draft: PostingDraft }) => {
  const groups = [
    ['하는 일', lines(draft.description)],
    ['자격 요건', draft.requirements],
    ['우대 사항', draft.preferred],
    ['근무 조건', lines(textFromConditions(draft.workConditions))],
  ] as const
  return (
    <div className="draft-card">
      <div className="biz-bar">
        <strong className="b1">{draft.title}</strong>
        <span className="badge orange">{DRAFT_BADGE}</span>
      </div>
      {groups.map(([label, items]) =>
        items.length === 0 ? null : (
          <div key={label}>
            <span className="c1 t3">{label}</span>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ),
      )}
      <Link className="btn pri" to="/employer/postings/new" state={draft}>
        {DRAFT_POSTING}
      </Link>
    </div>
  )
}

export default ChatDraftCard
