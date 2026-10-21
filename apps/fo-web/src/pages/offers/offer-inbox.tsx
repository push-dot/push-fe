import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { brandOf, clockLabel, initials, relativeTime } from '../../format'
import { useSession } from '../../shared/auth/use-session'
import Toast, { useToast } from '../../shared/ui/toast'
import {
  OFFER_ACCEPT,
  OFFER_ACCEPTED,
  OFFER_DECLINE,
  OFFER_DECLINED,
  OFFER_EMPTY_RECEIVED,
  OFFER_EMPTY_SENT,
  OFFER_LOAD_ERROR,
  OFFER_MESSAGES_EMPTY,
  OFFER_PICK,
  OFFER_POSTING,
  OFFER_PROFILE,
  OFFER_PUBLIC_NOTE,
  OFFER_SEND,
} from './constants'
import { offerStatusLabel } from './offer-status'

const OfferInbox = ({ selectedId }: { selectedId?: string }) => {
  const session = useSession()
  const [params, setParams] = useSearchParams()
  const box = params.get('box') === 'sent' ? 'sent' : 'received'
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const [reply, setReply] = useState('')
  const [draft, setDraft] = useState('')
  const received = useQuery({ queryKey: ['offers', 'received'], queryFn: () => api.me.offers('received') })
  const sent = useQuery({ queryKey: ['offers', 'sent'], queryFn: () => api.me.offers('sent') })
  const offerQuery = useQuery({ queryKey: ['offer', selectedId], queryFn: () => api.me.offer(selectedId ?? ''), enabled: Boolean(selectedId) })
  const messagesQuery = useQuery({
    queryKey: ['offer-messages', selectedId],
    queryFn: () => api.me.offerMessages(selectedId ?? ''),
    enabled: Boolean(selectedId),
  })
  const items = (box === 'sent' ? sent.data?.data : received.data?.data) ?? []
  const empty = box === 'sent' ? OFFER_EMPTY_SENT : OFFER_EMPTY_RECEIVED
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['offer', selectedId] })
    await queryClient.invalidateQueries({ queryKey: ['offer-messages', selectedId] })
    await queryClient.invalidateQueries({ queryKey: ['offers'] })
  }
  const accept = useMutation({
    mutationFn: () => api.me.acceptOffer(selectedId ?? '', reply.trim()),
    onSuccess: async () => {
      setReply('')
      show(OFFER_ACCEPTED)
      await refresh()
    },
  })
  const decline = useMutation({
    mutationFn: () => api.me.declineOffer(selectedId ?? ''),
    onSuccess: async () => {
      show(OFFER_DECLINED)
      await refresh()
    },
  })
  const send = useMutation({
    mutationFn: () => api.me.sendOfferMessage(selectedId ?? '', draft.trim()),
    onSuccess: async () => {
      setDraft('')
      await refresh()
    },
  })
  const offer = offerQuery.data
  const threadBox = offer && offer.sender.id === session?.user.id ? 'sent' : 'received'
  const person = offer ? (threadBox === 'received' ? offer.sender : offer.recipient) : null
  const actionable = Boolean(offer) && threadBox === 'received' && (offer?.status === 'SENT' || offer?.status === 'READ')
  const messages = messagesQuery.data?.data ?? []
  return (
    <main className="page">
      <h1 className="h1">제안함</h1>
      <div className="inbox">
        <section className="inbox-list">
          <div className="inbox-head">
            <div className="seg" role="tablist">
              <button type="button" role="tab" aria-selected={box === 'received'} onClick={() => setParams({ box: 'received' })}>
                {`받은 제안 ${received.data?.data.length ?? 0}`}
              </button>
              <button type="button" role="tab" aria-selected={box === 'sent'} onClick={() => setParams({ box: 'sent' })}>
                {`보낸 제안 ${sent.data?.data.length ?? 0}`}
              </button>
            </div>
          </div>
          {items.length === 0 && (box === 'sent' ? sent.data : received.data) ? <p className="b2 t3 empty-copy">{empty}</p> : null}
          {items.map((item) => {
            const who = box === 'received' ? item.sender : item.recipient
            return (
              <Link key={item.id} to={`/offers/${item.id}?box=${box}`} className={item.id === selectedId ? 'offer-line-row on' : 'offer-line-row'}>
                <span className="av hd-av" style={{ background: brandOf(who.displayName) }}>
                  {initials(who.displayName)}
                </span>
                <span className="offer-copy">
                  <span className="offer-line">
                    <span className="b2 w7">{who.displayName}</span>
                    <span className="c1 t3">{relativeTime(item.createdAt)}</span>
                  </span>
                  {box === 'received' && item.sender.affiliation ? <span className="c1 t3">{item.sender.affiliation}</span> : null}
                  <span className="b2 t2 cap">{item.message}</span>
                </span>
                <span className="badge grey">{offerStatusLabel(item.status, box)}</span>
              </Link>
            )
          })}
          <p className="c1 t3" style={{ padding: 16 }}>
            {OFFER_PUBLIC_NOTE}
          </p>
        </section>
        <section className="inbox-thread">
          {!selectedId ? <p className="b2 t3">{items.length === 0 ? empty : OFFER_PICK}</p> : null}
          {selectedId && offerQuery.isError ? <p className="b2 t3">{OFFER_LOAD_ERROR}</p> : null}
          {selectedId && !offer && !offerQuery.isError ? <p className="b2 t3" aria-busy="true" /> : null}
          {offer && person ? (
            <>
              <div className="thread-head">
                <span>
                  <span className="h2">{person.displayName}</span>
                  {threadBox === 'received' && offer.sender.affiliation ? <span className="c1 t3">{offer.sender.affiliation}</span> : null}
                </span>
                <span className="badge grey">{offerStatusLabel(offer.status, threadBox)}</span>
              </div>
              {threadBox === 'received' ? (
                <Link className="text-link" to={`/profiles/${offer.sender.id}`}>
                  {OFFER_PROFILE}
                </Link>
              ) : null}
              {offer.posting ? (
                <Link to={`/postings/${offer.posting.id}`} className="box" style={{ padding: 16 }}>
                  <span className="c1 t3">{OFFER_POSTING}</span>
                  <span className="b1 w7">{offer.posting.title}</span>
                </Link>
              ) : null}
              <div className="bubble">
                <p className="b1">{offer.message}</p>
                <span className="c1 t3">{clockLabel(offer.createdAt)}</span>
              </div>
              {actionable ? (
                <section className="stack">
                  <label className="field">
                    답장
                    <textarea rows={4} value={reply} onChange={(event) => setReply(event.target.value)} />
                  </label>
                  <div className="link-row">
                    <button type="button" className="btn sec sm" disabled={decline.isPending} onClick={() => decline.mutate()}>
                      {OFFER_DECLINE}
                    </button>
                    <button type="button" className="btn pri sm" disabled={reply.trim().length === 0 || accept.isPending} onClick={() => accept.mutate()}>
                      {OFFER_ACCEPT}
                    </button>
                  </div>
                </section>
              ) : null}
              <div className="msg-list">
                {messages.length === 0 ? <p className="b2 t3">{OFFER_MESSAGES_EMPTY}</p> : null}
                {messages.map((item) => {
                  const mine = item.sender.id === session?.user.id
                  return (
                    <div key={item.id} className={mine ? 'bubble mine' : 'bubble'}>
                      <span className="c1 t3">{item.sender.displayName}</span>
                      <p className="b2">{item.body}</p>
                      <span className="c1 t3">{clockLabel(item.createdAt)}</span>
                    </div>
                  )
                })}
              </div>
              <label className="field">
                메시지
                <textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} />
              </label>
              <button type="button" className="btn pri" disabled={draft.trim().length === 0 || send.isPending} onClick={() => send.mutate()}>
                {OFFER_SEND}
              </button>
            </>
          ) : null}
        </section>
      </div>
      <Toast message={message} />
    </main>
  )
}

export default OfferInbox
