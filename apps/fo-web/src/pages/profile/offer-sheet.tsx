import { ApiError } from '@push/api-client'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { OFFER_MAX, OFFER_SENT } from './constants'
import { profilesOffer } from '../../features/send-offer'


const OfferSheet = ({ userId, name, onClose, onSent }: { userId: string; name: string; onClose: () => void; onSent: (message: string) => void }) => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const ready = message.trim().length >= 1 && message.trim().length <= OFFER_MAX
  const send = useMutation({
    mutationFn: () => profilesOffer(userId, { message: message.trim() }),
    onSuccess: () => onSent(OFFER_SENT),
    onError: (reason) => {
      setError(reason instanceof ApiError && reason.code === 'CONFLICT' ? '이미 제안을 보냈어요.' : '제안을 보내지 못했어요. 잠시 후 다시 시도해 주세요.')
    },
  })
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="제안하기" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <h2 className="h3">제안하기</h2>
          <button type="button" className="text-link" onClick={onClose}>
            닫기
          </button>
        </div>
        <label className="field">
          메시지
          <textarea value={message} maxLength={OFFER_MAX} rows={6} onChange={(event) => setMessage(event.target.value)} />
          <span className="c1 t3">{`${message.length} / ${OFFER_MAX}`}</span>
        </label>
        <p className="c1 t3">{`제안은 ${name} 님의 알림과 메시지함으로 전달돼요.`}</p>
        {error ? <p className="auth-error">{error}</p> : null}
        <button type="button" className="primary" disabled={!ready || send.isPending} onClick={() => send.mutate()}>
          제안 보내기
        </button>
      </div>
    </div>
  )
}

export default OfferSheet
