import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { isWebView } from '../../shared/lib/bridge'
import { brandOf, dDay } from '../../shared/lib/format'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { canUseEmployerAi } from '../../shared/model/employer-plan'
import type { PostingView } from '../../shared/api/mock'
import ApplySheet from './apply-sheet'
import {
  APPLIED_LABEL,
  APPLIED_TOAST,
  APPLY_ASIDE,
  APPLY_LABEL,
  BOOKMARK_LABEL,
  BOOKMARK_SAVED,
  EMPLOYER_POSTING_CTA,
  EMPLOYER_POSTING_NOTE,
  EMPLOYER_VERIFY_PATH,
  SHARE_LABEL,
  guestApplyAction,
} from './constants'
import GuestApplyDialog from './guest-apply-dialog'
import { postingActionMode } from '../../entities/posting'
import { shareLink } from '../../features/share-posting'
import { postingsBookmark, postingsUnbookmark } from '../../features/bookmark-posting'


const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const area = document.createElement('textarea')
    area.value = url
    area.setAttribute('readonly', '')
    document.body.append(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
}

const monthDay = (iso: string | null) => {
  if (!iso) return null
  const [, month, day] = iso.slice(0, 10).split('-').map(Number)
  if (!month || !day) return null
  return `${month}월 ${day}일`
}

const PostingActions = ({ posting, onToast }: { posting: PostingView; onToast: (message: string) => void }) => {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [applyOpen, setApplyOpen] = useState(false)
  const [guestOpen, setGuestOpen] = useState(false)
  const accountType = session?.user.accountType
  const mode = postingActionMode({
    webView: isWebView(),
    accountType: accountType === 'PERSONAL' || accountType === 'EMPLOYER' ? accountType : null,
  })
  const bookmark = useMutation({
    mutationFn: () => (posting.bookmarked ? postingsUnbookmark(posting.id) : postingsBookmark(posting.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posting', posting.id] })
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
  if (mode === 'webview') return null
  const returnTo = `/postings/${posting.id}`
  const goLogin = () => {
    saveReturnTo(returnTo)
    navigate('/login')
  }
  const onBookmark = () => {
    if (mode === 'guest') {
      goLogin()
      return
    }
    bookmark.mutate()
  }
  const onApply = () => {
    const next = guestApplyAction(mode, posting.applied)
    if (next === 'done' || next === 'ignore') return
    if (next === 'dialog') {
      setGuestOpen(true)
      return
    }
    setApplyOpen(true)
  }
  const share = async () => {
    const url = window.location.href
    const toast = await shareLink({
      url,
      finePointer: window.matchMedia('(pointer: fine)').matches,
      canShare: typeof navigator.canShare === 'function' ? (data) => navigator.canShare(data) : undefined,
      share: typeof navigator.share === 'function' ? (data) => navigator.share(data) : undefined,
      copy: copyUrl,
    })
    if (toast) onToast(toast)
  }
  const dday = dDay(posting.deadline)
  const when = monthDay(posting.deadline)
  return (
    <>
      <aside className="job-aside">
        <div className="box job-apply">
          <div className="pair">
            {posting.imageUrl ? (
              <img className="av hd-av" src={assetUrl(posting.imageUrl)} alt="" />
            ) : (
              <span className="av hd-av" style={{ background: brandOf(posting.company) }}>
                {[...posting.company][0]}
              </span>
            )}
            <span>
              <span className="b2 w7">{posting.company}</span>
              <span className="c1 t3 cap">{posting.title}</span>
            </span>
          </div>
          <p className="b2 t2">{[when ? `${when} 마감` : null, dday].filter(Boolean).join(' · ')}</p>
          {mode === 'employer' ? (
            <Link
              className="btn pri lg block"
              to={
                canUseEmployerAi(session?.user.companyId != null && session.user.companyId !== '')
                  ? `/employer/chat/new?postingId=${encodeURIComponent(posting.id)}`
                  : EMPLOYER_VERIFY_PATH
              }
            >
              <svg className="ic spark" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 3c.6 4 2.7 6.1 6.7 6.7-4 .6-6.1 2.7-6.7 6.7-.6-4-2.7-6.1-6.7-6.7C8.3 9.1 10.4 7 11 3Z" />
              </svg>
              {EMPLOYER_POSTING_CTA}
            </Link>
          ) : (
            <button type="button" className={mode === 'personal' && posting.applied ? 'btn pri lg block dis' : 'btn pri lg block'} disabled={mode === 'personal' && posting.applied} onClick={onApply}>
              {mode === 'personal' && posting.applied ? APPLIED_LABEL : APPLY_LABEL}
            </button>
          )}
          {mode === 'employer' ? <p className="c1 t3">{EMPLOYER_POSTING_NOTE}</p> : null}
          <div className="apply-row">
            <button type="button" className="btn sec" aria-pressed={posting.bookmarked} disabled={bookmark.isPending} onClick={onBookmark}>
              {posting.bookmarked ? BOOKMARK_SAVED : BOOKMARK_LABEL}
            </button>
            <button type="button" className="btn sec" onClick={() => void share()}>
              {SHARE_LABEL}
            </button>
          </div>
        </div>
        <p className="c1 t3">{APPLY_ASIDE}</p>
      </aside>
      {applyOpen ? (
        <ApplySheet
          postingId={posting.id}
          onClose={() => setApplyOpen(false)}
          onApplied={() => {
            setApplyOpen(false)
            onToast(APPLIED_TOAST)
          }}
        />
      ) : null}
      {guestOpen ? (
        <GuestApplyDialog
          onClose={() => setGuestOpen(false)}
          onLogin={goLogin}
          onSignup={() => {
            saveReturnTo(returnTo)
          }}
        />
      ) : null}
    </>
  )
}

export default PostingActions
