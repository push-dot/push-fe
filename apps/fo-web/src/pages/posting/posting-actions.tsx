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
  APPLIED_HINT,
  APPLIED_LABEL,
  APPLIED_TOAST,
  APPLY_ASIDE,
  APPLY_LABEL,
  BOOKMARK_LABEL,
  EMPLOYER_POSTING_CTA,
  EMPLOYER_POSTING_NOTE,
  EMPLOYER_VERIFY_PATH,
  SHARE_LABEL,
  applicantsLabel,
  guestApplyAction,
} from './constants'
import GuestApplyDialog from './guest-apply-dialog'
import { postingActionMode } from '../../entities/posting'
import { shareLink } from '../../features/share-posting'
import { postingsBookmark, postingsUnbookmark } from '../../features/bookmark-posting'

const ClockIcon = () => (
  <svg className="ic" viewBox="0 0 24 24" width={16} height={16} aria-hidden="true">
    <path d="M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0ZM12 7.5V12l3 2" />
  </svg>
)

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
  const applicants = (posting as { applicantCount?: number }).applicantCount
  const applied = mode === 'personal' && posting.applied
  const primary = (className: string) =>
    mode === 'employer' ? (
      <Link
        className={`btn pri lg ${className}`}
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
      <button type="button" className={`btn pri lg ${className}${applied ? ' dis' : ''}`} disabled={applied} onClick={onApply}>
        {applied ? APPLIED_LABEL : APPLY_LABEL}
      </button>
    )
  const secondary = (className: string) => (
    <>
      <button type="button" className={`btn sec ${className}${posting.bookmarked ? ' on' : ''}`} aria-label={BOOKMARK_LABEL} aria-pressed={posting.bookmarked} disabled={bookmark.isPending} onClick={onBookmark}>
        <Icon name="bookmark" size={18} width={2.2} filled={posting.bookmarked} />
        <span className="job-lbl">{BOOKMARK_LABEL}</span>
      </button>
      <button type="button" className={`btn sec ${className}`} aria-label={SHARE_LABEL} onClick={() => void share()}>
        <Icon name="share" size={18} width={2.2} />
        <span className="job-lbl">{SHARE_LABEL}</span>
      </button>
    </>
  )
  return (
    <>
      <aside className="job-aside">
        <div className="box job-apply">
          <div className="pair">
            {posting.imageUrl ? (
              <img className="av co-mark lg" src={assetUrl(posting.imageUrl)} alt="" />
            ) : (
              <span className="av co-mark lg" style={{ background: brandColor(posting.company) }}>
                {[...posting.company][0]}
              </span>
            )}
            <span>
              <span className="c1 t3 w6">{posting.company}</span>
              <span className="b1 w7 cap">{posting.title}</span>
            </span>
          </div>
          <div className="job-meta b2 t2">
            <span>
              <span className="deco">
                <ClockIcon />
              </span>
              {[when ? `${when} 마감` : null, dday].filter(Boolean).join(' · ')}
            </span>
            {applicants != null ? (
              <span>
                <span className="deco">
                  <Icon name="people" size={16} />
                </span>
                {applicantsLabel(applicants)}
              </span>
            ) : null}
          </div>
          {primary('block job-cta')}
          {applied ? <span className="job-note c1 t3">{APPLIED_HINT}</span> : null}
          {mode === 'employer' ? <span className="job-note c1 t3">{EMPLOYER_POSTING_NOTE}</span> : null}
          <div className="apply-row job-secondary">{secondary('')}</div>
        </div>
        <p className="c1 t3 job-hint">{APPLY_ASIDE}</p>
      </aside>
      <div className="bottom-bar job-bar">
        <span className="job-sum">
          <span className="c1 t3 w6 cap">{posting.company}</span>
          <span className="b1 w7 cap">{posting.title}</span>
        </span>
        {secondary('job-bar-btn')}
        {primary('job-bar-cta')}
      </div>
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
