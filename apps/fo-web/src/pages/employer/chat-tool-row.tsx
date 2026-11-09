import type { TurnTool } from '../../features/employer-chat'
import { TOOL_STOPPED } from './chat-copy'

const ChatToolRow = ({ tool }: { tool: TurnTool }) => {
  const running = tool.state === 'run'
  const result = tool.state === 'stop' ? TOOL_STOPPED : (tool.resultLine ?? tool.error)
  return (
    <div className="chat-tool">
      <div className="b2 chat-tool-head">
        {running ? (
          <span className="chat-spin" aria-hidden="true" />
        ) : (
          <span className={`ai-dot ${tool.state}`} aria-hidden="true" />
        )}
        <span>
          <b className="w7">{tool.summary}</b>{' '}
          {tool.target ? <span className="t3">{tool.target}</span> : null}
        </span>
      </div>
      {result || running ? (
        <div className="b2 t2 chat-tool-result">
          <span className="chat-elbow" aria-hidden="true" />
          {result ? (
            <span>
              {result}
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
  )
}

export default ChatToolRow
