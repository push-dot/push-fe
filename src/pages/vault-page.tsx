import { useEffect, useState } from 'react'
import { assignInlineVars } from '@vanilla-extract/dynamic'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { formatRelativeTime } from '@/shared/lib/format'
import { menuX, menuY } from '@push/design-system'
import { useT } from '@/shared/i18n'
import { type CareerEvidence, type VerificationStatus, useArchiveEvidence } from '@/features/evidence'
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

type MenuState = { x: number; y: number; item: CareerEvidence }

const VaultPage = () => {
  const t = useT()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useCareerEvidence()
  const archiveEvidence = useArchiveEvidence()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [menu, setMenu] = useState<MenuState | null>(null)

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null)
    }
    window.addEventListener('click', close)
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', close)
    }
  }, [menu])

  const openMenu = (e: ReactMouseEvent, item: CareerEvidence) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, item })
  }

  const removeItem = (item: CareerEvidence) =>
    archiveEvidence.mutate({ id: item.id, revision: item.revision })

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
              <div key={item.id} onContextMenu={(e) => openMenu(e, item)}>
                <DataListRow
                  title={item.title}
                  meta={`${KIND_LABELS[item.kind]} · ${formatRelativeTime(item.createdAt)}`}
                  trailing={
                    <StatusChip
                      tone={STATUS_TONES[item.verificationStatus]}
                      label={item.verificationStatus}
                      icon={item.verificationStatus === 'VERIFIED' ? <Icon name="badge-check" size={16} /> : undefined}
                    />
                  }
                />
              </div>
            ))}
          </DataList>
        ) : null}
      </div>
      <EvidenceAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {menu ? (
        <div
          className="context-menu"
          style={assignInlineVars({
            [menuX]: `${Math.min(menu.x, window.innerWidth - 170)}px`,
            [menuY]: `${Math.min(menu.y, window.innerHeight - 140)}px`,
          })}
          role="menu"
        >
          <button
            type="button"
            className="context-menu-item is-danger"
            onClick={() => removeItem(menu.item)}
          >
            <Icon name="trash-2" size={16} />
            {t('menu.delete')}
          </button>
        </div>
      ) : null}
    </>
  )
}

export default VaultPage
