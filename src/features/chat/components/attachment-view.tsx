import type { MessageAttachment } from '../api/schemas'
import { useT } from '@/shared/i18n'
import ApprovalSurface from './approval-surface'
import { Button, Icon } from '@/shared/components'
import type { VersionExportHandler } from '../types'

const AttachmentView = ({
  attachment,
  user,
  onExportVersion,
}: {
  attachment: MessageAttachment
  user?: boolean
  onExportVersion?: VersionExportHandler
}) => {
  const t = useT()
  if (attachment.type === 'APPROVAL') {
    return <ApprovalSurface approvalId={attachment.id} />
  }
  const label =
    attachment.type === 'EVIDENCE'
      ? t('chat.evidenceLinked')
      : t('chat.docVersion')
  return (
    <div className={user ? 'chat-attach-chip chat-attach-chip-user' : 'chat-attach-chip'}>
      <Icon name="link-2" size={16} />
      <span className="chat-attach-chip-title">{attachment.title}</span>
      <span className="chat-attach-chip-meta">{label}</span>
      {attachment.type === 'DOCUMENT_VERSION' && onExportVersion ? (
        <span className="chat-attach-chip-actions">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              void onExportVersion(attachment.documentId, attachment.id, 'PDF', attachment.title)
            }
          >
            {t('chat.exportPdf')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              void onExportVersion(attachment.documentId, attachment.id, 'DOCX', attachment.title)
            }
          >
            {t('chat.exportDocx')}
          </Button>
        </span>
      ) : null}
    </div>
  )
}

export default AttachmentView
