import type { TurnTool } from '../../features/employer-chat'
import ChatDraftCard from './chat-draft-card'
import { TOOL_STATE_LABEL } from './constants'

const TONE = { run: 'grey', wait: 'orange', ok: 'green', err: 'red' } as const

const ChatToolRow = ({ tool }: { tool: TurnTool }) => (
  <li className="chat-msg">
    <span className="chat-tool">
      <span className={`badge ${TONE[tool.state]}`}>{TOOL_STATE_LABEL[tool.state]}</span>
      <span className="b2">{tool.summary}</span>
    </span>
    {tool.draft ? <ChatDraftCard draft={tool.draft} postingId={tool.postingId} /> : null}
  </li>
)

export default ChatToolRow
