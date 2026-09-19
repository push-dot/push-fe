import { useState } from 'react'
import { formatRelativeTime } from '@/shared/lib/format'
import { type VerificationStatus } from '@/features/evidence'
import {
  Button,
  CanvasHeader,
  DataList,
  DataListRow,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonRows,
  StatusChip,
} from '@/shared/components'
import type { StatusChipTone } from '@/shared/components'
import { useCareerEvidence } from '@/features/evidence'
import { EvidenceAddDialog } from '@/features/evidence'

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

const VaultPage = () => {
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useCareerEvidence()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <CanvasHeader
        title="커리어 볼트"
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> 근거 추가
          </Button>
        }
      />
      <div className="canvas-body">
        {isPending ? (
          <DataList>
            <SkeletonRows count={3} height={52} />
          </DataList>
        ) : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? (
          <EmptyState
            message="아직 근거가 없어요"
            actionLabel="근거 추가"
            onAction={() => setDialogOpen(true)}
          />
        ) : null}
        {isSuccess && items.length > 0 ? (
          <DataList>
            {items.map((item) => (
              <DataListRow
                key={item.id}
                title={item.title}
                meta={`${KIND_LABELS[item.kind]} · ${formatRelativeTime(item.createdAt)}`}
                trailing={
                  <StatusChip
                    tone={STATUS_TONES[item.verificationStatus]}
                    label={item.verificationStatus}
                    icon={item.verificationStatus === 'VERIFIED' ? 'badge-check' : undefined}
                  />
                }
              />
            ))}
          </DataList>
        ) : null}
      </div>
      <EvidenceAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}

export default VaultPage
