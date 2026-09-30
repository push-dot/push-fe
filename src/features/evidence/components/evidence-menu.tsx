import { ContextMenu, ContextMenuItem } from '@/shared/components'
import { useT } from '@/shared/i18n'
import { Icon } from '@/shared/components'

const EvidenceMenu = ({
  x,
  y,
  onClose,
  onDelete,
}: {
  x: number
  y: number
  onClose: () => void
  onDelete: () => void
}) => {
  const t = useT()
  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      <ContextMenuItem autoFocus danger icon={<Icon name="trash-2" size={16} />} onClick={onDelete}>
        {t('menu.delete')}
      </ContextMenuItem>
    </ContextMenu>
  )
}

export default EvidenceMenu
