import { useState } from 'react'
import type { Approval, ApprovalKind } from '../api/schemas'
import { useApproval, useDecideApproval } from '../api/hooks'
import { Button, Icon, StatusChip, showToast } from '@/shared/components'
import { trackExperimentEvent } from '@/shared/api'
import { EXPERIMENT_EVENTS, EXPERIMENT_KEYS } from '@/shared/constants'
import { useExperimentConversion } from '@/shared/lib/experiment'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'

const KIND_TITLES: Record<ApprovalKind, MsgKey> = {
  CLI_EXECUTE: 'approval.kindCli',
  DOCUMENT_FINALIZE: 'approval.kindDoc',
  APPLICATION_SUBMIT: 'approval.kindApp',
  EVIDENCE_USE: 'approval.kindEvidence',
}

const STATUS_LABELS: Record<Approval['status'], MsgKey> = {
  PENDING: 'approval.statusPending',
  APPROVED: 'approval.statusApproved',
  DENIED: 'approval.statusDenied',
  EXPIRED: 'approval.statusExpired',
  CONSUMED: 'approval.statusConsumed',
}

type ApprovalCardProps = {
  approvalId: string
}

const ApprovalCard = ({ approvalId }: ApprovalCardProps) => {
  const t = useT()
  const { data } = useApproval(approvalId)
  const approval = data?.approval ?? null
  const summary = data?.targetSummary ?? null
  const decide = useDecideApproval(approvalId)
  const trackConversion = useExperimentConversion(EXPERIMENT_KEYS.approvalSurface)
  const [busy, setBusy] = useState(false)

  if (!approval) return null

  const onDecide = async (decision: 'APPROVED' | 'DENIED') => {
    setBusy(true)
    try {
      await decide.mutateAsync(decision)
      trackConversion()
      if (decision === 'DENIED') {
        void trackExperimentEvent('approval-surface', EXPERIMENT_EVENTS.reject).catch(
          () => undefined,
        )
      }
      showToast(decision === 'APPROVED' ? t('approval.approved') : t('approval.denied'))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('approval.failed'), 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  const title = summary?.title
    ? `${t(KIND_TITLES[approval.kind])} — ${summary.title}`
    : t(KIND_TITLES[approval.kind])

  const command =
    summary?.executable || summary?.prompt
      ? [
          summary.executable
            ? `$ ${summary.executable}${summary.arguments?.length ? ` ${summary.arguments.join(' ')}` : ''}`
            : null,
          summary.workingDirectory ? `${t('approval.dir')}: ${summary.workingDirectory}` : null,
          summary.prompt ? `${t('approval.prompt')}: ${summary.prompt}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null

  return (
    <div className="approval-card">
      <div className="approval-card-title">{title}</div>
      {command ? <div className="approval-card-cmd">{command}</div> : null}
      <div className="approval-card-body">
        {approval.status === 'PENDING'
          ? t('approval.body')
          : t(STATUS_LABELS[approval.status])}
      </div>
      {approval.status === 'PENDING' ? (
        <div className="approval-card-actions">
          <Button
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={() => void onDecide('DENIED')}
          >
            <Icon name="x" size={20} /> {t('approval.deny')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={busy}
            onClick={() => void onDecide('APPROVED')}
          >
            <Icon name="check" size={20} /> {t('approval.approve')}
          </Button>
        </div>
      ) : (
        <div className="approval-card-actions">
          <StatusChip
            tone={approval.status === 'APPROVED' ? 'verified' : 'pending'}
            label={t(STATUS_LABELS[approval.status])}
          />
        </div>
      )}
    </div>
  )
}

export default ApprovalCard
