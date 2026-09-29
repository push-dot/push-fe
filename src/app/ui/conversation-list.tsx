import { useCallback, useEffect, useState } from 'react'
import { assignInlineVars } from '@vanilla-extract/dynamic'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { menuX, menuY } from '@push/design-system'
import { useT } from '@/shared/i18n'
import { Icon, showToast } from '@/shared/components'
import {
  isProjectConversation,
  prefetchMessages,
  useArchiveConversation,
  useConversations,
  useCreateConversation,
  usePatchConversation,
} from '@/features/chat'
import { listMessages } from '@/features/chat'
import type { Conversation } from '@/features/chat'
import { useMessagesStore } from '@/features/chat'

const NEW_CHAT_TITLES = new Set(['새 채팅', 'New chat'])

const MOD = /mac/i.test(navigator.platform) ? '⌘' : 'Ctrl+'

type MenuState = { conv: Conversation; x: number; y: number }

export const useNewChat = () => {
  const t = useT()
  const navigate = useNavigate()
  const { data: conversations = [] } = useConversations()
  const createConversation = useCreateConversation()

  const newChat = useCallback(async () => {
    if (createConversation.isPending) return
    const candidate = conversations.find((c) => NEW_CHAT_TITLES.has(c.title))
    if (candidate) {
      try {
        const env = await listMessages(candidate.id, { limit: 1 })
        if (env.data.length === 0) {
          navigate(ROUTES.chat(candidate.id))
          return
        }
      } catch {
        // fall through to create
      }
    }
    try {
      const conversation = await createConversation.mutateAsync({
        applicationId: null,
        title: t('nav.newChat'),
      })
      navigate(ROUTES.chat(conversation.id))
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('toast.createChatFailed'),
        'circle-alert',
      )
    }
  }, [conversations, createConversation, navigate, t])

  return { newChat, creating: createConversation.isPending }
}

const ConversationList = ({ onNewChat }: { onNewChat: () => void }) => {
  const t = useT()
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: conversations = [] } = useConversations()
  const archiveConversation = useArchiveConversation()
  const patchConversation = usePatchConversation()
  const sendingTo = useMessagesStore((s) =>
    s.sendStatus === 'sending' || s.sendStatus === 'streaming' ? s.conversationId : null,
  )

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

  const activeChatId = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/')[2]
    : null

  const removeChat = async (id: string) => {
    try {
      await archiveConversation.mutateAsync(id)
      if (id === activeChatId) navigate(ROUTES.home)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('toast.deleteChatFailed'),
        'circle-alert',
      )
    }
  }

  const togglePin = async (conv: Conversation) => {
    try {
      await patchConversation.mutateAsync({ id: conv.id, patch: { pinned: !conv.pinned } })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'error', 'circle-alert')
    }
  }

  const commitRename = async () => {
    if (!editing) return
    const title = editing.value.trim()
    const conv = conversations.find((c) => c.id === editing.id)
    setEditing(null)
    if (!conv || !title || title === conv.title) return
    try {
      await patchConversation.mutateAsync({ id: conv.id, patch: { title } })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'error', 'circle-alert')
    }
  }

  const openMenu = (e: ReactMouseEvent, conv: Conversation) => {
    e.preventDefault()
    setMenu({ conv, x: e.clientX, y: e.clientY })
  }

  const isBusy = (id: string) => sendingTo === id

  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-label">{t('nav.chat')}</div>
        <button
          type="button"
          className="sidebar-item"
          title={`${t('nav.newChat')} (${MOD}⇧O)`}
          onClick={onNewChat}
        >
          <Icon name="square-pen" size={20} />
          <span className="sidebar-item-label">{t('nav.newChat')}</span>
        </button>
        {conversations.map((c) => (
          <div
            key={c.id}
            className={c.id === activeChatId ? 'sidebar-item is-active' : 'sidebar-item'}
            onClick={() => navigate(ROUTES.chat(c.id))}
            onMouseEnter={() => prefetchMessages(c.id)}
            onContextMenu={(e) => openMenu(e, c)}
            role="button"
          >
            {isBusy(c.id) ? <span className="sidebar-dot is-busy" /> : null}
            {editing?.id === c.id ? (
              <input
                className="sidebar-item-input"
                value={editing.value}
                autoFocus
                onChange={(e) => setEditing({ id: c.id, value: e.target.value })}
                onBlur={() => void commitRename()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void commitRename()
                  if (e.key === 'Escape') setEditing(null)
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="sidebar-item-label">{c.title}</span>
            )}
            {c.pinned ? (
              <span className="sidebar-item-pin">
                <Icon name="pin" size={16} />
              </span>
            ) : null}
            {isProjectConversation(c) ? (
              <span className="sidebar-tag">{t('nav.projectTag')}</span>
            ) : null}
          </div>
        ))}
      </div>
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
            className="context-menu-item"
            onClick={() => setEditing({ id: menu.conv.id, value: menu.conv.title })}
          >
            <Icon name="pencil" size={16} />
            {t('menu.rename')}
          </button>
          <button
            type="button"
            className="context-menu-item"
            onClick={() => void togglePin(menu.conv)}
          >
            <Icon name={menu.conv.pinned ? 'pin-off' : 'pin'} size={16} />
            {menu.conv.pinned ? t('menu.unpin') : t('menu.pin')}
          </button>
          <button
            type="button"
            className="context-menu-item is-danger"
            onClick={() => void removeChat(menu.conv.id)}
          >
            <Icon name="trash-2" size={16} />
            {t('menu.delete')}
          </button>
        </div>
      ) : null}
    </>
  )
}

export default ConversationList
