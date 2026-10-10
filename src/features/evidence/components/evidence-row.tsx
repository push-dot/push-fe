import type { MouseEvent as ReactMouseEvent } from 'react'
import { formatRelativeTime } from '@/shared/lib/format'
import { DataListRow, Icon, StatusChip } from '@/shared/components'
import type { StatusChipTone } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import type { CareerEvidence, VerificationStatus } from '../api/schemas'

const STATUS_TONES: Record<VerificationStatus, StatusChipTone> = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  USER_PROVIDED: 'pending',
  REJECTED: 'error',
}

const KIND_LABEL_KEYS: Record<string, MsgKey> = {
  RESUME: 'evidence.kinds.RESUME',
  GITHUB: 'evidence.kinds.GITHUB',
  CAREER: 'evidence.kinds.CAREER',
  EDUCATION: 'evidence.kinds.EDUCATION',
  SKILL: 'evidence.kinds.SKILL',
  PROJECT: 'evidence.kinds.PROJECT',
}

const EvidenceRow = ({
  item,
  onMenu,
}: {
  item: CareerEvidence
  onMenu: (e: ReactMouseEvent) => void
}) => {
  const t = useT()
  return (
    <div onContextMenu={onMenu}>
      <DataListRow
        title={item.title}
        meta={`${t(KIND_LABEL_KEYS[item.kind] ?? 'evidence.kinds.PROJECT')} · ${formatRelativeTime(item.createdAt)}`}
        trailing={
          <StatusChip
            tone={STATUS_TONES[item.verificationStatus]}
            label={item.verificationStatus}
            icon={
              item.verificationStatus === 'VERIFIED' ? (
                <Icon name="badge-check" size={16} />
              ) : undefined
            }
          />
        }
      />
    </div>
  )
}

export default EvidenceRow
