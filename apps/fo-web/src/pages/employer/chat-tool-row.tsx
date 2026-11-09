import type { TurnTool } from '../../features/employer-chat'
import ChatDraftCard from './chat-draft-card'

const ChatToolRow = ({ tool }: { tool: TurnTool }) => {
  const running = tool.state === 'run'
  return (
    <>
      <div className="chat-tool">
        <div className="b2 chat-tool-head">
          {running ? <span className="chat-spin" aria-hidden="true" /> : <span className={`ai-dot ${tool.state}`} aria-hidden="true" />}
          <span>
            <b className="w7">{tool.summary}</b> {tool.target ? <span className="t3">{tool.target}</span> : null}
          </span>
        </div>
        {tool.resultLine || tool.error || running ? (
          <div className="b2 t2 chat-tool-result">
            <span className="chat-elbow" aria-hidden="true" />
            {tool.resultLine || tool.error ? (
              <span>
                {tool.resultLine ?? tool.error}
                {tool.extra?.map((line) => (
                  <span key={line} className="c1 t3 chat-tool-extra">
                    {line}
                  </span>
                ))}
              </span>
            ) : (
              <span className="chat-tool-wait" aria-hidden="true">
                <i />
                <i />
              </span>
            )}
          </div>
        ) : null}
      </div>
      {tool.draft ? <ChatDraftCard draft={tool.draft} postingId={tool.postingId} /> : null}
    </>
  )
}

export default ChatToolRow
