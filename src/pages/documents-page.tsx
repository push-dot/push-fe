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
import { useApplications } from '@/features/applications'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'

const KIND_LABEL_KEYS: Record<DocumentKind, MsgKey> = {
  RESUME: 'docDialog.kindResume',
  COVER_LETTER: 'docDialog.kindCoverLetter',
  PORTFOLIO: 'docDialog.kindPortfolio',
}

const DocumentsPage = () => {
  const t = useT()
  const navigate = useNavigate()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useDocuments()
  const { data: applications = [] } = useApplications()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <CanvasHeader
        title={t('nav.documents')}
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> {t('docDialog.new')}
          </Button>
        }
      />
      <div className="canvas-body">
        {isPending ? <SkeletonCardGrid count={3} /> : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? (
          <EmptyState
            message={t('documents.empty')}
            actionLabel={t('docDialog.new')}
            onAction={() => setDialogOpen(true)}
          />
        ) : null}
        {isSuccess && items.length > 0 ? (
          <CardGrid>
            {items.map((doc) => (
              <DocCard
                key={doc.id}
                title={doc.title}
                meta={`${t(KIND_LABEL_KEYS[doc.kind])} · ${formatRelativeTime(doc.updatedAt)}`}
                onOpen={() => navigate(ROUTES.document(doc.id))}
              />
            ))}
          </CardGrid>
        ) : null}
      </div>
      <NewDocumentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        applications={applications}
      />
    </>
  )
}

export default DocumentsPage
