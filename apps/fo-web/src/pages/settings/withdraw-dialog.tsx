import { ApiError } from '@push/api-client'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSignOut } from '../../features/sign-out'
import { meDeleteAccount } from '../../features/update-settings'
import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { ADMIN_TRANSFER, DELETE_FAILED, DELETE_RETENTION, DELETE_SUBSCRIPTION, WITHDRAW_CONFIRM, WITHDRAW_TITLE } from './constants'

const WithdrawDialog = ({ subscriptionNote, onClose }: { subscriptionNote: boolean; onClose: () => void }) => {
  const navigate = useNavigate()
  const signOut = useSignOut()
  const [failed, setFailed] = useState(false)
  const [adminBlocked, setAdminBlocked] = useState(false)
  const withdraw = useMutation({
    mutationFn: () => meDeleteAccount(),
    onSuccess: () => signOut({ revoke: false }),
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'ADMIN_TRANSFER_REQUIRED') setAdminBlocked(true)
      else setFailed(true)
    },
  })
  if (adminBlocked) {
    return (
      <ConfirmDialog
        title={ADMIN_TRANSFER.title}
        body={ADMIN_TRANSFER.body}
        cancelLabel={ADMIN_TRANSFER.close}
        confirmLabel={ADMIN_TRANSFER.action}
        onConfirm={() => navigate('/employer/members')}
        onClose={onClose}
      />
    )
  }
  return (
    <ConfirmDialog
      title={WITHDRAW_TITLE}
      danger
      busy={withdraw.isPending}
      confirmLabel={WITHDRAW_CONFIRM}
      onConfirm={() => withdraw.mutate()}
      onClose={onClose}
      body={
        <div className="withdraw-body">
          {subscriptionNote ? (
            <p className="withdraw-warn">
              <Icon name="warn" size={20} />
              <span className="b2">{DELETE_SUBSCRIPTION}</span>
            </p>
          ) : null}
          <p>{DELETE_RETENTION}</p>
          {failed ? (
            <p className="auth-error" role="alert">
              {DELETE_FAILED}
            </p>
          ) : null}
        </div>
      }
    />
  )
}

export default WithdrawDialog
