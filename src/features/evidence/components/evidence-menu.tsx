import { assignInlineVars } from '@vanilla-extract/dynamic'
import { menuX, menuY } from '@push/design-system'
import { useT } from '@/shared/i18n'
import { Icon } from '@/shared/components'

const EvidenceMenu = ({
  x,
  y,
  onDelete,
}: {
  x: number
  y: number
  onDelete: () => void
}) => {
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
      <button type="button" className="context-menu-item is-danger" onClick={onDelete}>
        <Icon name="trash-2" size={16} />
        {t('menu.delete')}
      </button>
    </div>
  )
}

export default EvidenceMenu
