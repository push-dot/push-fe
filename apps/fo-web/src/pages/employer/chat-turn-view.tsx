import { Link } from 'react-router-dom'
import {
  answerParts,
  questionsText,
  type ThreadItem,
  type TurnBlock,
} from '../../features/employer-chat'
import { Icon } from '../../shared/ui/icon'
import { ChatActionsContext, useChatActions } from './chat-actions'
import ChatAnswer from './chat-answer'
import ChatApprovalCard from './chat-approval-card'
import ChatChoiceCard from './chat-choice-card'
import ChatDraftCard from './chat-draft-card'
import ChatPlanCard from './chat-plan-card'
import ChatQueueCard from './chat-queue-card'
import ChatToolRow from './chat-tool-row'
import { COPY, INTERVIEW_ASK, INTERVIEW_MAKE, OPEN_APPLICANT, SAVE_PDF, WRITING } from './chat-copy'

type TurnItem = Extract<ThreadItem, { kind: 'turn' }>

const draftOf = (block: TurnBlock | undefined) =>
  block?.kind === 'tool' && block.draft ? (
    <ChatDraftCard draft={block.draft} postingId={block.postingId} />
  ) : undefined

type BlockProps = {
  block: TurnBlock
  previous: TurnBlock | undefined
  next: TurnBlock | undefined
  live: boolean
}

const Block = ({ block, previous, next, live }: BlockProps) => {
  switch (block.kind) {
    case 'text':
      return (
        <ChatAnswer
          text={block.text}
          live={live}
          after={previous?.kind === 'plan' ? 'plan' : 'start'}
          insert={draftOf(previous)}
        />
      )
    case 'tool':
      // The text written right after a draft introduces it, so the card moves under that text.
      return (
        <>
          <ChatToolRow tool={block} />
          {next?.kind === 'text' ? null : draftOf(block)}
        </>
      )
    case 'approval':
      return <ChatApprovalCard approval={block} />
    case 'choice':
      return <ChatChoiceCard choice={block} />
    case 'plan':
      return <ChatPlanCard plan={block} />
  }
}

const ChatTurnView = ({ item, applicationId }: { item: TurnItem; applicationId?: string }) => {
  const actions = useChatActions()
  const { blocks, queued } = item.turn
  const running = item.live && actions.busy
  const last = blocks.at(-1)
  const questions = blocks
    .flatMap((block) => (block.kind === 'text' ? answerParts(block.text) : []))
    .flatMap((part) => (part.kind === 'questions' ? part.items : []))
  const person = actions.people.find((entry) => entry.applicationId === applicationId)
  const copy = () => {
    void navigator.clipboard
      ?.writeText(questionsText(questions))
      .then(actions.copied, () => undefined)
  }
  return (
    <ChatActionsContext.Provider
      value={{ ...actions, picked: { ...item.picked, ...actions.picked } }}
    >
      {blocks.map((block, index) => (
        <Block
          key={
            block.kind === 'approval' || block.kind === 'choice' || block.kind === 'plan'
              ? block.id
              : block.key
          }
          block={block}
          previous={blocks[index - 1]}
          next={blocks[index + 1]}
          live={running && index === blocks.length - 1}
        />
      ))}
      {queued !== null && running ? <ChatQueueCard ahead={queued} /> : null}
      {running && last?.kind === 'text' ? (
        <span className="c1 t3 chat-writing">
          <span className="chat-spin sm" aria-hidden="true" />
          {WRITING}
        </span>
      ) : null}
      {!running && blocks.some((block) => block.kind === 'plan') ? (
        <div className="chat-follow">
          <button
            type="button"
            className="chip"
            disabled={actions.busy}
            onClick={() => actions.send(INTERVIEW_ASK, 'interview')}
          >
            <Icon name="spark" size={16} />
            {INTERVIEW_MAKE}
          </button>
          {person ? (
            <Link
              className="chip"
              to={`/employer/postings/${person.postingId}/applicants/${person.applicationId}`}
            >
              {OPEN_APPLICANT}
            </Link>
          ) : null}
        </div>
      ) : null}
      {!running && questions.length > 0 ? (
        <div className="chat-follow">
          <button type="button" className="chip" onClick={copy}>
            <Icon name="copy" size={16} />
            {COPY}
          </button>
          <button type="button" className="chip" onClick={() => window.print()}>
            <Icon name="doc" size={16} />
            {SAVE_PDF}
          </button>
        </div>
      ) : null}
    </ChatActionsContext.Provider>
  )
}

export default ChatTurnView
