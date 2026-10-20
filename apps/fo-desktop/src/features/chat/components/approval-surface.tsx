import { useEffect, useState } from 'react'
import { Dialog } from '@/shared/components'
import { EXPERIMENT_EVENTS, EXPERIMENT_KEYS } from '@/shared/constants'
import { trackExperiment, useExperimentVariant } from '@/shared/lib/experiment'
import { useT } from '@/shared/i18n'
import { useApproval } from '../api/hooks'
import ApprovalCard from './approval-card'

type ApprovalSurfaceProps = {
  approvalId: string
}

const ApprovalSurface = ({ approvalId }: ApprovalSurfaceProps) => {
  const t = useT()
  const variant = useExperimentVariant(EXPERIMENT_KEYS.approvalSurface)
  const { data } = useApproval(approvalId)
  const pending = data?.approval.status === 'PENDING'
  const [dismissedId, setDismissedId] = useState<string | null>(null)

  useEffect(() => {
    if (pending) {
      trackExperiment(EXPERIMENT_KEYS.approvalSurface, EXPERIMENT_EVENTS.exposure, approvalId)
    }
  }, [pending, approvalId])

  return (
    <>
      <ApprovalCard approvalId={approvalId} />
      <Dialog
        open={variant === 'B' && pending && dismissedId !== approvalId}
        title={t('approval.title')}
        onClose={() => setDismissedId(approvalId)}
      >
        <ApprovalCard approvalId={approvalId} />
      </Dialog>
    </>
  )
}

export default ApprovalSurface
