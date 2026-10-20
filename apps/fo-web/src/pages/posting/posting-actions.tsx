import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { isWebView } from '../../bridge'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { canUseEmployerAi } from '../../shared/model/employer-plan'
import type { PostingView } from '../../mock'
import ApplySheet from './apply-sheet'
import {
  APPLIED_LABEL,
  APPLIED_TOAST,
  APPLY_LABEL,
  BOOKMARK_LABEL,
  EMPLOYER_POSTING_CTA,
  EMPLOYER_VERIFY_PATH,
  LINK_COPIED_TOAST,
  SHARE_LABEL,
} from './constants'
import { postingActionMode } from './posting-mode'

const PostingActions = ({ posting, onToast }: { posting: PostingView; onToast: (message: string) => void }) => {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [applyOpen, setApplyOpen] = useState(false)
  const accountType = session?.user.accountType
  const mode = postingActionMode({
    webView: isWebView(),
    accountType: accountType === 'PERSONAL' || accountType === 'EMPLOYER' ? accountType : null,
  })
  const bookmark = useMutation({
    mutationFn: () => (posting.bookmarked ? api.postings.unbookmark(posting.id) : api.postings.bookmark(posting.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posting', posting.id] })
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
    },
  })
  if (mode === 'webview') return null
  const goLogin = () => {
    saveReturnTo(`/postings/${posting.id}`)
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
    if (posting.applied) return
    if (mode !== 'personal') {
      goLogin()
      return
    }
    setApplyOpen(true)
  }
  const share = async () => {
    const url = window.location.href
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url })
      } catch {
        return
      }
      return
    }
    await navigator.clipboard.writeText(url)
    onToast(LINK_COPIED_TOAST)
  }
  return (
    <>
      <div className="posting-tools">
        <button type="button" aria-pressed={posting.bookmarked} disabled={bookmark.isPending} onClick={onBookmark}>
          {BOOKMARK_LABEL}
        </button>
        <button type="button" onClick={() => void share()}>
          {SHARE_LABEL}
        </button>
      </div>
      <div className="bottom-bar">
        {mode === 'employer' ? (
          <Link
            className="pill"
            to={
              canUseEmployerAi(session?.user.companyId != null && session.user.companyId !== '')
                ? `/employer/chat/new?postingId=${encodeURIComponent(posting.id)}`
                : EMPLOYER_VERIFY_PATH
            }
          >
            {EMPLOYER_POSTING_CTA}
          </Link>
        ) : (
          <button type="button" className="pill" disabled={mode === 'personal' && posting.applied} onClick={onApply}>
            {mode === 'personal' && posting.applied ? APPLIED_LABEL : APPLY_LABEL}
          </button>
        )}
      </div>
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
    </>
  )
}

export default PostingActions
