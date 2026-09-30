import { useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import {
  Button,
  CanvasHeader,
  DataList,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonRows,
} from '@/shared/components'
import { type CareerEvidence, useArchiveEvidence } from '@/features/evidence'
import { useCareerEvidence } from '@/features/evidence'
import { EvidenceAddDialog, EvidenceMenu, EvidenceRow } from '@/features/evidence'

type MenuState = { x: number; y: number; item: CareerEvidence }

const VaultPage = () => {
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useCareerEvidence()
  const archiveEvidence = useArchiveEvidence()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [menu, setMenu] = useState<MenuState | null>(null)

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
              <EvidenceRow key={item.id} item={item} onMenu={(e) => openMenu(e, item)} />
            ))}
          </DataList>
        ) : null}
      </div>
      <EvidenceAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {menu ? (
        <EvidenceMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onDelete={() => removeItem(menu.item)}
        />
      ) : null}
    </>
  )
}

export default VaultPage
