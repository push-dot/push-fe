import type { CompanyPosting } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  AI_POSTING,
  FILTER_ALL,
  NEW_POSTING,
  POSTING_CLOSE,
  POSTING_CLOSED,
  POSTING_CLOSE_BODY,
  POSTING_CLOSE_FAILED,
  POSTING_CLOSE_TITLE,
  POSTINGS_EMPTY,
  POSTINGS_FAILED,
  POSTINGS_HEAD,
  POSTINGS_LOADING,
  POSTINGS_TITLE,
  STATUS_CLOSED,
  STATUS_DRAFT,
  STATUS_OPEN,
} from './constants'
import { useMyPostings } from '../../entities/posting'
import { postingsClose } from '../../features/edit-posting'
import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import PostingRow from './posting-row'
import { FILTERS, filterRows, type PostingFilter } from './posting-view'

const FILTER_LABEL: Record<PostingFilter, string> = { all: FILTER_ALL, open: STATUS_OPEN, draft: STATUS_DRAFT, closed: STATUS_CLOSED }

const PostingsPage = () => {
  const [filter, setFilter] = useState<PostingFilter>('all')
  const [closing, setClosing] = useState<CompanyPosting | null>(null)
  const toast = useToast()
  const queryClient = useQueryClient()
  const postings = useMyPostings()
  const close = useMutation({
    mutationFn: (posting: CompanyPosting) => postingsClose(posting.id, posting.revision ?? 0),
    onSuccess: async () => {
      toast.show(POSTING_CLOSED)
      await queryClient.invalidateQueries({ queryKey: ['company-postings'] })
    },
    onError: () => toast.show(POSTING_CLOSE_FAILED, { tone: 'err' }),
    onSettled: () => setClosing(null),
  })
  if (postings.isError) {
    return (
      <main className="page biz-page">
        <h1 className="h1">{POSTINGS_TITLE}</h1>
        <ErrorState title={POSTINGS_FAILED} onRetry={() => void postings.refetch()} boxed />
      </main>
    )
  }
  if (!postings.data) {
    return (
      <main className="page biz-page" aria-busy="true">
        <p className="b2 t3 stack">{POSTINGS_LOADING}</p>
      </main>
    )
  }
  const rows = postings.data.data
  const complete = !postings.data.page.hasMore
  const visible = filterRows(rows, filter)
  const now = Date.now()
  return (
    <main className="page biz-page">
      <header className="head biz-bar">
        <h1 className="h1">{POSTINGS_TITLE}</h1>
        <span className="biz-actions">
          <Link className="btn sec sm" to="/employer/chat/new">
            <Icon name="spark" size={16} filled />
            {AI_POSTING}
          </Link>
          <Link className="btn pri sm" to="/employer/postings/new">
            <Icon name="plus" size={16} width={2.4} />
            {NEW_POSTING}
          </Link>
        </span>
      </header>
      <div className="chips">
        {FILTERS.map((item) => (
          <button key={item.key} type="button" className="chip" aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>
            {complete ? `${FILTER_LABEL[item.key]} ${filterRows(rows, item.key).length}` : FILTER_LABEL[item.key]}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <StateBlock icon="brief" title={POSTINGS_EMPTY} boxed />
      ) : (
        <div className="box biz-card posting-cols">
          <div className="biz-head c1 w7 t3" aria-hidden="true">
            <span className="biz-main">{POSTINGS_HEAD[0]}</span>
            <span className="biz-status">{POSTINGS_HEAD[1]}</span>
            <span className="biz-count">{POSTINGS_HEAD[2]}</span>
            <span className="biz-date">{POSTINGS_HEAD[3]}</span>
            <span className="biz-more" />
          </div>
          <ul className="biz-list">
            {visible.map((posting) => (
              <PostingRow key={posting.id} posting={posting} now={now} onClose={setClosing} />
            ))}
          </ul>
        </div>
      )}
      {closing ? (
        <ConfirmDialog
          title={POSTING_CLOSE_TITLE}
          body={POSTING_CLOSE_BODY}
          confirmLabel={POSTING_CLOSE}
          danger
          busy={close.isPending}
          onConfirm={() => close.mutate(closing)}
          onClose={() => setClosing(null)}
        />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} />
    </main>
  )
}

export default PostingsPage
