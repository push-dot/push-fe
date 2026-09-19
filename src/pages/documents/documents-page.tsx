import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { formatRelativeTime } from '@/shared/lib/format'
import { type DocumentKind } from '@/features/documents'
import {
  CanvasHeader,
  Button,
  CardGrid,
  DocCard,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonCardGrid,
} from '@/shared/components'
import { useDocuments } from '@/features/documents'
import { NewDocumentDialog } from '@/features/documents'

const KIND_LABELS: Record<DocumentKind, string> = {
  RESUME: '이력서',
  COVER_LETTER: '자기소개서',
  PORTFOLIO: '포트폴리오',
}

const DocumentsPage = () => {
  const navigate = useNavigate()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useDocuments()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <CanvasHeader
        title="내 서류"
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> 새 문서
          </Button>
        }
      />
      <div className="canvas-body">
        {isPending ? <SkeletonCardGrid count={3} /> : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? (
          <EmptyState
            message="아직 문서가 없어요"
            actionLabel="새 문서"
            onAction={() => setDialogOpen(true)}
          />
        ) : null}
        {isSuccess && items.length > 0 ? (
          <CardGrid>
            {items.map((doc) => (
              <DocCard
                key={doc.id}
                title={doc.title}
                meta={`${KIND_LABELS[doc.kind]} · ${formatRelativeTime(doc.updatedAt)}`}
                onOpen={() => navigate(ROUTES.document(doc.id))}
              />
            ))}
          </CardGrid>
        ) : null}
      </div>
      <NewDocumentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}

export default DocumentsPage
