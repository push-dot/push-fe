import type { MouseEvent as ReactMouseEvent } from 'react'
import { useT } from '@/shared/i18n'
import { Icon } from '@/shared/components'
import { isProjectConversation } from '@/features/chat/stores'
import type { Conversation } from '@/features/chat/api/schemas'

type ConversationItemProps = {
  conv: Conversation
  active: boolean
  busy: boolean
  editing: boolean
  onOpen: () => void
  onPrefetch: () => void
  onMenu: (e: ReactMouseEvent) => void
  onEditEnd: (title: string | null) => void
}

const ConversationItem = ({
  conv,
  active,
  busy,
  editing,
  onOpen,
  onPrefetch,
  onMenu,
  onEditEnd,
}: ConversationItemProps) => {
  const t = useT()
  return (
    <div
      className={active ? 'sidebar-item is-active' : 'sidebar-item'}
      onClick={onOpen}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      onContextMenu={onMenu}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      role="button"
      tabIndex={0}
      aria-current={active ? 'page' : undefined}
    >
      {busy ? <span className="sidebar-dot is-busy" /> : null}
      {editing ? (
        <input
          className="sidebar-item-input"
          defaultValue={conv.title}
          autoFocus
          onBlur={(e) => onEditEnd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditEnd(e.currentTarget.value)
            if (e.key === 'Escape') onEditEnd(null)
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="sidebar-item-label">{conv.title}</span>
      )}
      {conv.pinned ? (
        <span className="sidebar-item-pin">
          <Icon name="pin" size={16} />
        </span>
      ) : null}
      {isProjectConversation(conv) ? (
        <span className="sidebar-tag">{t('nav.projectTag')}</span>
      ) : null}
    </div>
  )
}

export default ConversationItem
