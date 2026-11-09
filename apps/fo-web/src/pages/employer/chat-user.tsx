import { brandColor } from '@push/shared'
import type { Attachment } from '../../features/employer-chat'
import { useEmployerPosting, useMyPostings } from '../../entities/posting'
import { useChatActions } from './chat-actions'
import {
  applicantKicker,
  POSTING_CLOSED_KICKER,
  POSTING_OPEN_KICKER,
  referenceKicker,
} from './chat-copy'

const Chip = ({
  mark,
  color,
  kicker,
  title,
  company,
}: {
  mark: string
  color: string
  kicker: string
  title: string
  company?: boolean
}) => (
  <span className="chat-attach-chip">
    <span className={company ? 'av chat-av co' : 'av chat-av'} style={{ background: color }}>
      {mark}
    </span>
    <span className="chat-attach-copy">
      <span className="c2 t3 w6">{kicker}</span>
      <span className="b2 w7">{title}</span>
    </span>
  </span>
)

const PostingChip = ({ id, title }: { id: string; title?: string }) => {
  const mine = useMyPostings().data?.data.find((item) => item.id === id)
  const posting = useEmployerPosting(mine ? undefined : id).data
  const company = mine?.company ?? posting?.company ?? ''
  const kicker = mine
    ? mine.closedAt
      ? POSTING_CLOSED_KICKER
      : POSTING_OPEN_KICKER
    : company
      ? referenceKicker(company)
      : POSTING_OPEN_KICKER
  return (
    <Chip
      company
      mark={company.slice(0, 1)}
      color={brandColor(company)}
      kicker={kicker}
      title={title || mine?.title || posting?.title || ''}
    />
  )
}

const ApplicantChip = ({ id, title }: { id: string; title?: string }) => {
  const person = useChatActions().people.find((item) => item.applicationId === id)
  const name = person?.name ?? title?.split(' · ')[0] ?? ''
  return (
    <Chip
      mark={name.slice(-2)}
      color={brandColor(name)}
      kicker={applicantKicker(person?.postingTitle ?? '')}
      title={title || name}
    />
  )
}

const ChatUser = ({ text, attachments }: { text: string; attachments: Attachment[] }) => (
  <div className="chat-user">
    {attachments.map((item) =>
      item.type === 'POSTING' ? (
        <PostingChip key={item.id} id={item.id} title={item.title} />
      ) : item.type === 'APPLICATION' ? (
        <ApplicantChip key={item.id} id={item.id} title={item.title} />
      ) : null,
    )}
    <span className="b1 chat-bubble">{text}</span>
  </div>
)

export default ChatUser
