import { brandColor, monthDay } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { isWebView } from '../../shared/lib/bridge'
import { dDay } from '../../shared/lib/format'
import { saveReturnTo } from '../../shared/auth/return-path'
import { Icon } from '../../shared/ui/icon'
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
              <span className="av hd-av" style={{ background: brandColor(posting.company) }}>
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
              <Icon name="spark" size={18} filled />
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
              <Icon name="bookmark" size={18} width={2.2} filled={posting.bookmarked} />
              {posting.bookmarked ? BOOKMARK_SAVED : BOOKMARK_LABEL}
            </button>
            <button type="button" className="btn sec" onClick={() => void share()}>
              <Icon name="share" size={18} width={2.2} />
              {SHARE_LABEL}
            </button>
          </div>
        </div>
        <p className="c1 t3">{APPLY_ASIDE}</p>
      </aside>
      {applyOpen ? (
        <ApplySheet
          postingId={posting.id}
          company={posting.company}
          title={posting.title}
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
