import { ContextMenu, ContextMenuItem } from '@/shared/components'
import { useT } from '@/shared/i18n'
import { Icon } from '@/shared/components'
import type { Conversation } from '@/features/chat/api/schemas'

type ConversationMenuProps = {
  conv: Conversation
  x: number
  y: number
  onClose: () => void
  onRename: () => void
  onTogglePin: () => void
  onDelete: () => void
}

const ConversationMenu = ({
  conv,
  x,
  y,
  onClose,
  onRename,
  onTogglePin,
  onDelete,
}: ConversationMenuProps) => {
  const t = useT()
  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      <ContextMenuItem icon={<Icon name="pencil" size={16} />} onClick={onRename}>
        {t('menu.rename')}
      </ContextMenuItem>
      <ContextMenuItem
        icon={<Icon name={conv.pinned ? 'pin-off' : 'pin'} size={16} />}
        onClick={onTogglePin}
      >
        {conv.pinned ? t('menu.unpin') : t('menu.pin')}
      </ContextMenuItem>
      <ContextMenuItem danger icon={<Icon name="trash-2" size={16} />} onClick={onDelete}>
        {t('menu.delete')}
      </ContextMenuItem>
    </ContextMenu>
  )
}

export default ConversationMenu
