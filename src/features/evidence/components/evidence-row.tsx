import type { MouseEvent as ReactMouseEvent } from 'react'
import { formatRelativeTime } from '@/shared/lib/format'
import { DataListRow, Icon, StatusChip } from '@/shared/components'
import type { StatusChipTone } from '@/shared/components'
import type { CareerEvidence, VerificationStatus } from '../api/schemas'

const STATUS_TONES: Record<VerificationStatus, StatusChipTone> = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  USER_PROVIDED: 'pending',
  REJECTED: 'error',
}

const KIND_LABELS: Record<string, string> = {
  RESUME: '이력서',
  GITHUB: 'GitHub',
  CAREER: '경력',
  EDUCATION: '학력',
  SKILL: '기술',
  PROJECT: '프로젝트',
}

const EvidenceRow = ({
  item,
  onMenu,
}: {
  item: CareerEvidence
  onMenu: (e: ReactMouseEvent) => void
}) => (
  <div onContextMenu={onMenu}>
    <DataListRow
      title={item.title}
      meta={`${KIND_LABELS[item.kind]} · ${formatRelativeTime(item.createdAt)}`}
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

export default EvidenceRow
