import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api'
import { useSession } from '../../shared/auth/use-session'
import Toast, { useToast } from '../../shared/ui/toast'
import { offerStatusLabel } from './offer-status'

const OfferDetailPage = () => {
  const { id = '' } = useParams()
  const session = useSession()
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const [reply, setReply] = useState('')
  const [draft, setDraft] = useState('')
  const offerQuery = useQuery({ queryKey: ['offer', id], queryFn: () => api.me.offer(id) })
  const messagesQuery = useQuery({ queryKey: ['offer-messages', id], queryFn: () => api.me.offerMessages(id) })
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['offer', id] })
    await queryClient.invalidateQueries({ queryKey: ['offer-messages', id] })
    await queryClient.invalidateQueries({ queryKey: ['offers'] })
  }
  const accept = useMutation({
    mutationFn: () => api.me.acceptOffer(id, reply.trim()),
    onSuccess: async () => {
      setReply('')
      show('제안을 수락했어요')
      await refresh()
    },
  })
  const decline = useMutation({
    mutationFn: () => api.me.declineOffer(id),
    onSuccess: async () => {
      show('제안을 거절했어요')
      await refresh()
    },
  })
  const send = useMutation({
    mutationFn: () => api.me.sendOfferMessage(id, draft.trim()),
    onSuccess: async () => {
      setDraft('')
      await refresh()
    },
  })
  const offer = offerQuery.data
  if (offerQuery.isError) return <main className="page"><p className="b2 t3">제안을 불러오지 못했어요.</p></main>
  if (!offer) return <main className="page" aria-busy="true" />
  const box = offer.sender.id === session?.user.id ? 'sent' : 'received'
  const actionable = box === 'received' && (offer.status === 'SENT' || offer.status === 'READ')
  const messages = messagesQuery.data?.data ?? []
  return (
    <main className="page">
      <header className="head">
        <h1 className="h2">{box === 'received' ? offer.sender.displayName : offer.recipient.displayName}</h1>
        <span className="badge grey">{offerStatusLabel(offer.status, box)}</span>
      </header>
      <p className="b1 post-body">{offer.message}</p>
      {offer.posting ? (
        <Link to={`/postings/${offer.posting.id}`} className="b2 w7">
          {offer.posting.title}
        </Link>
      ) : null}
      {actionable ? (
        <section className="stack">
          <label className="field">
            답장
            <textarea rows={4} value={reply} onChange={(event) => setReply(event.target.value)} />
          </label>
          <div className="link-row">
            <button type="button" className="text-link danger" disabled={decline.isPending} onClick={() => decline.mutate()}>
              거절
            </button>
            <button type="button" className="primary slim" disabled={reply.trim().length === 0 || accept.isPending} onClick={() => accept.mutate()}>
              수락하고 답장하기
            </button>
          </div>
        </section>
      ) : null}
      <section className="stack">
        <h2 className="h3">메시지</h2>
        {messages.length === 0 ? <p className="b2 t3">아직 메시지가 없어요.</p> : null}
        <ul className="comment-list">
          {messages.map((item) => (
            <li key={item.id} className="comment">
              <span className="b2 w7">{item.sender.displayName}</span>
              <p className="b2">{item.body}</p>
            </li>
          ))}
        </ul>
        <label className="field">
          메시지
          <textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button type="button" className="primary" disabled={draft.trim().length === 0 || send.isPending} onClick={() => send.mutate()}>
          보내기
        </button>
      </section>
      <Toast message={message} />
    </main>
  )
}

export default OfferDetailPage
