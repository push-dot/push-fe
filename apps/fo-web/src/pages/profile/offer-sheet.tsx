import { CAREER_STATUSES, JOB_CATEGORIES, type Profile } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { assetUrl } from '../../shared/api/client'
import { initials } from '../../shared/lib/format'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { OFFER_BLOCKED, OFFER_MAX, OFFER_SENT } from './constants'
import { offerFailure } from './offer-error'
import { profilesOffer } from '../../features/send-offer'

type OfferTarget = Profile & { blockedMe?: boolean }

const OfferSheet = ({ profile, onClose, onSent }: { profile: OfferTarget; onClose: () => void; onSent: (message: string) => void }) => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState(profile.blockedMe === true)
  const ready = message.trim().length >= 1 && message.trim().length <= OFFER_MAX
  const category = JOB_CATEGORIES.find((item) => item.key === profile.jobCategory)?.label
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  const meta = [category, profile.tenureYears != null ? `${profile.tenureYears}년` : null, status].filter(Boolean).join(' · ')
  const send = useMutation({
    mutationFn: () => profilesOffer(profile.userId, { message: message.trim() }),
    onSuccess: () => onSent(OFFER_SENT),
    onError: (reason) => {
      const failure = offerFailure(reason)
      if (failure.blocked) setBlocked(true)
      else setError(failure.message)
    },
  })
  return (
    <Dialog label="제안하기" onClose={onClose} wide>
      <div className="offer-head">
        {profile.avatarUrl ? (
          <img className="av" src={assetUrl(profile.avatarUrl)} alt="" />
        ) : (
          <span className="av" style={{ background: brandColor(profile.displayName) }}>
            {initials(profile.displayName)}
          </span>
        )}
        <div className="offer-who">
          <h2 className="h3">{`${profile.displayName} 님에게`}</h2>
          <span className="c1 t3">{meta}</span>
        </div>
        <button type="button" className="hbtn offer-close" aria-label="닫기" onClick={onClose}>
          <Icon name="close" size={18} width={2.4} />
        </button>
      </div>
      <label className="offer-box">
        <textarea aria-label="메시지" value={message} maxLength={OFFER_MAX} rows={5} onChange={(event) => setMessage(event.target.value)} />
        <span className="c1 t3 num">{`${message.length} / ${OFFER_MAX}`}</span>
      </label>
      {blocked ? (
        <div className="offer-blocked b2 t2" role="alert">
          <Icon name="info" size={20} />
          {OFFER_BLOCKED}
        </div>
      ) : (
        <p className="c1 t3">{`제안은 ${profile.displayName} 님의 알림과 제안함으로 전달돼요.`}</p>
      )}
      {error ? <p className="auth-error">{error}</p> : null}
      <button type="button" className="btn pri lg block" disabled={!ready || blocked || send.isPending} onClick={() => send.mutate()}>
        제안 보내기
      </button>
    </Dialog>
  )
}

export default OfferSheet
