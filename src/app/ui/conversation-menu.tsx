import { assignInlineVars } from '@vanilla-extract/dynamic'
import { menuX, menuY } from '@push/design-system'
import { useT } from '@/shared/i18n'
import { Icon } from '@/shared/components'
import type { Conversation } from '@/features/chat/api/schemas'

type ConversationMenuProps = {
  conv: Conversation
  x: number
  y: number
  onRename: () => void
  onTogglePin: () => void
  onDelete: () => void
}

const ConversationMenu = ({
  conv,
  x,
  y,
  onRename,
  onTogglePin,
  onDelete,
}: ConversationMenuProps) => {
  const t = useT()
  return (
    <div
      className="context-menu"
      style={assignInlineVars({
        [menuX]: `${Math.min(x, window.innerWidth - 170)}px`,
        [menuY]: `${Math.min(y, window.innerHeight - 140)}px`,
      })}
      role="menu"
    >
      {/* eslint-disable-next-line jsx-a11y/no-autofocus -- moving focus into the menu on open is the intended keyboard behavior */}
      <button type="button" className="context-menu-item" autoFocus onClick={onRename}>
        <Icon name="pencil" size={16} />
        {t('menu.rename')}
      </button>
      <button type="button" className="context-menu-item" onClick={onTogglePin}>
        <Icon name={conv.pinned ? 'pin-off' : 'pin'} size={16} />
        {conv.pinned ? t('menu.unpin') : t('menu.pin')}
      </button>
      <button type="button" className="context-menu-item is-danger" onClick={onDelete}>
        <Icon name="trash-2" size={16} />
        {t('menu.delete')}
      </button>
    </div>
  )
}

export default ConversationMenu
