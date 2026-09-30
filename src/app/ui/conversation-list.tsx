import { useCallback, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import { Icon, showToast, Tooltip } from '@/shared/components'
import {
  prefetchMessages,
  useArchiveConversation,
  useConversationPeek,
  useConversations,
  useCreateConversation,
  usePatchConversation,
} from '@/features/chat/api/hooks'
import type { Conversation } from '@/features/chat/api/schemas'
import { useMessagesStore } from '@/features/chat/stores'
import ConversationItem from './conversation-item'
import ConversationMenu from './conversation-menu'

const NEW_CHAT_TITLES = new Set(['새 채팅', 'New chat'])

const MOD = /mac/i.test(navigator.platform) ? '⌘' : 'Ctrl+'

type MenuState = { conv: Conversation; x: number; y: number }

export const useNewChat = () => {
  const t = useT()
  const navigate = useNavigate()
  const { data: conversations = [] } = useConversations()
  const createConversation = useCreateConversation()
  const peek = useConversationPeek()

  const newChat = useCallback(async () => {
    if (createConversation.isPending) return
    const candidate = conversations.find((c) => NEW_CHAT_TITLES.has(c.title))
    if (candidate) {
      try {
        const env = await peek.mutateAsync(candidate.id)
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
  }, [conversations, createConversation, peek.mutateAsync, navigate, t])

  return { newChat, creating: createConversation.isPending }
}

const ConversationList = ({ onNewChat }: { onNewChat: () => void }) => {
  const t = useT()
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: conversations = [] } = useConversations()
  const archiveConversation = useArchiveConversation()
  const patchConversation = usePatchConversation()
  const sendingTo = useMessagesStore((s) =>
    s.sendStatus === 'sending' || s.sendStatus === 'streaming' ? s.conversationId : null,
  )

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

  const commitRename = async (conv: Conversation, title: string | null) => {
    setEditingId(null)
    const next = title?.trim()
    if (!next || next === conv.title) return
    try {
      await patchConversation.mutateAsync({ id: conv.id, patch: { title: next } })
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'error', 'circle-alert')
    }
  }

  const openMenu = (e: ReactMouseEvent, conv: Conversation) => {
    e.preventDefault()
    setMenu({ conv, x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-label">{t('nav.chat')}</div>
        <Tooltip label={`${t('nav.newChat')} (${MOD}⇧O)`} position="right">
          <button type="button" className="sidebar-item" onClick={onNewChat}>
            <Icon name="square-pen" size={20} />
            <span className="sidebar-item-label">{t('nav.newChat')}</span>
          </button>
        </Tooltip>
        {conversations.map((c) => (
          <ConversationItem
            key={c.id}
            conv={c}
            active={c.id === activeChatId}
            busy={sendingTo === c.id}
            editing={editingId === c.id}
            onOpen={() => navigate(ROUTES.chat(c.id))}
            onPrefetch={() => prefetchMessages(c.id)}
            onMenu={(e) => openMenu(e, c)}
            onEditEnd={(title) => void commitRename(c, title)}
          />
        ))}
      </div>
      {menu ? (
        <ConversationMenu
          conv={menu.conv}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onRename={() => {
            setEditingId(menu.conv.id)
            setMenu(null)
          }}
          onTogglePin={() => void togglePin(menu.conv)}
          onDelete={() => void removeChat(menu.conv.id)}
        />
      ) : null}
    </>
  )
}

export default ConversationList
