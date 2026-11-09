import { Fragment, type ReactNode } from 'react'
import { answerParts } from '../../features/employer-chat'
import ChatDraftCard from './chat-draft-card'
import ChatQuestions from './chat-questions'

export const ChatSay = ({ text, soft }: { text: string; soft?: boolean }) => (
  <div className="chat-say">
    <span className="ai-dot ac" aria-hidden="true" />
    <div className={soft ? 'b1 t2' : 'b1'}>{text}</div>
  </div>
)

type ChatAnswerProps = { text: string; live: boolean; after: 'start' | 'plan'; insert?: ReactNode }

/**
 * Assistant text: paragraphs, numbered questions with 확인할 점, and a posting-draft fence. `insert` (the draft card of the
 * tool row above) goes after the first paragraph, and the text after it reads softer, as on WebBizAiDraft.
 */
const ChatAnswer = ({ text, live, after, insert }: ChatAnswerProps) => {
  const parts = answerParts(text)
  return (
    <>
      {parts.map((part, index) => {
        const last = index === parts.length - 1
        const body =
          part.kind === 'questions' ? (
            <ChatQuestions items={part.items} caret={live && last} />
          ) : part.kind === 'draft' ? (
            <ChatDraftCard draft={part.draft} />
          ) : after === 'plan' && index === 0 ? (
            <p className="c1 t3 chat-note">{part.text}</p>
          ) : (
            <ChatSay text={part.text} soft={Boolean(insert) && index > 0} />
          )
        return (
          <Fragment key={index}>
            {body}
            {index === 0 ? insert : null}
          </Fragment>
        )
      })}
      {parts.length === 0 ? insert : null}
    </>
  )
}

export default ChatAnswer
