import type { Question } from '../../features/employer-chat'
import { CHECK_POINT } from './chat-copy'

const ChatQuestions = ({ items, caret }: { items: Question[]; caret: boolean }) => (
  <div className={caret ? 'box chat-questions live' : 'box chat-questions'}>
    {items.map((item, index) => (
      <div key={`${item.n}-${index}`} className="chat-question">
        <span className="b1 w8 ac num chat-question-n">{item.n}</span>
        <span className="chat-question-copy">
          <span className="b1 w7">
            {item.text}
            {caret && index === items.length - 1 ? (
              <span className="chat-caret" aria-hidden="true" />
            ) : null}
          </span>
          {item.lines.map((line, at) =>
            line.check ? (
              <span key={at} className="c1 t2 chat-check">
                <b className="w7 t3">{CHECK_POINT}</b>
                <span>{line.text}</span>
              </span>
            ) : (
              <span key={at} className="c1 t2 chat-question-note">
                {line.text}
              </span>
            ),
          )}
        </span>
      </div>
    ))}
  </div>
)

export default ChatQuestions
