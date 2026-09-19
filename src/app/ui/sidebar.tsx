import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import { Icon, IconButton, showToast } from '@/shared/ui'
import type { IconName } from '@/shared/ui'
import { isProjectConversation, useConversationsStore } from '@/entities/conversation'
import { listMessages } from '@/shared/api'
import { useMessagesStore } from '@/features/chat'

const NAV_ITEMS: { to: string; icon: IconName; labelKey: MsgKey }[] = [
  { to: ROUTES.documents, icon: 'file-text', labelKey: 'nav.documents' },
  { to: ROUTES.applications, icon: 'briefcase', labelKey: 'nav.applications' },
  { to: ROUTES.vault, icon: 'archive', labelKey: 'nav.vault' },
  { to: ROUTES.interview, icon: 'mic', labelKey: 'nav.interview' },
  { to: ROUTES.calendar, icon: 'calendar', labelKey: 'nav.calendar' },
]

const NEW_CHAT_TITLES = new Set(['새 채팅', 'New chat'])

const Sidebar = () => {
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [peek, setPeek] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const conversations = useConversationsStore((s) => s.items)
  const loadConversations = useConversationsStore((s) => s.load)
  const createConversation = useConversationsStore((s) => s.create)
  const creating = useConversationsStore((s) => s.creating)
  const archiveConversation = useConversationsStore((s) => s.archive)
  const sendingTo = useMessagesStore((s) =>
    s.sendStatus === 'sending' || s.sendStatus === 'streaming' ? s.conversationId : null,
  )

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const activeChatId = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/')[2]
    : null

  const newChat = async () => {
    if (creating) return
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
      const conversation = await createConversation({
        applicationId: null,
        title: t('nav.newChat'),
      })
      navigate(ROUTES.chat(conversation.id))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('toast.createChatFailed'), 'circle-alert')
    }
  }

  const removeChat = async (id: string) => {
    try {
      await archiveConversation(id)
      if (id === activeChatId) navigate(ROUTES.home)
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('toast.deleteChatFailed'), 'circle-alert')
    }
  }

  const isBusy = (id: string) => sendingTo === id

  return (
    <>
      {collapsed ? <div className="sidebar-edge" onMouseEnter={() => setPeek(true)} /> : null}
      <aside
        className={collapsed ? `sidebar is-hidden${peek ? ' is-peek' : ''}` : 'sidebar'}
        onMouseLeave={() => {
          if (collapsed) setPeek(false)
        }}
      >
        <div className="sidebar-head">
          <span className="t-label">Push</span>
          <IconButton
            icon={collapsed ? 'panel-left-open' : 'panel-left-close'}
            aria-label={collapsed ? t('nav.pinSidebar') : t('nav.collapseSidebar')}
            onClick={() => {
              setCollapsed((v) => !v)
              setPeek(false)
            }}
          />
        </div>
        <div className="sidebar-scroll">
          <div className="sidebar-section">
            <div className="sidebar-label">{t('nav.chat')}</div>
            <button type="button" className="sidebar-item" onClick={() => void newChat()}>
              <Icon name="square-pen" size={20} />
              <span className="sidebar-item-label">{t('nav.newChat')}</span>
            </button>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={c.id === activeChatId ? 'sidebar-item is-active' : 'sidebar-item'}
                onClick={() => navigate(ROUTES.chat(c.id))}
                role="button"
              >
                {isBusy(c.id) ? <span className="sidebar-dot is-busy" /> : null}
                <span className="sidebar-item-label">{c.title}</span>
                {isProjectConversation(c) ? (
                  <span className="sidebar-tag">{t('nav.projectTag')}</span>
                ) : null}
                <IconButton
                  className="sidebar-item-delete"
                  icon="trash-2"
                  iconSize={16}
                  aria-label={t('nav.deleteChat')}
                  onClick={(e) => {
                    e.stopPropagation()
                    void removeChat(c.id)
                  }}
                />
              </div>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">{t('nav.features')}</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.to}
                type="button"
                className={
                  location.pathname.startsWith(item.to) ? 'sidebar-item is-active' : 'sidebar-item'
                }
                onClick={() => navigate(item.to)}
              >
                <Icon name={item.icon} size={20} />
                <span className="sidebar-item-label">{t(item.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-foot">
          <button
            type="button"
            className={
              location.pathname === ROUTES.settings ? 'sidebar-item is-active' : 'sidebar-item'
            }
            onClick={() => navigate(ROUTES.settings)}
          >
            <Icon name="settings" size={20} />
            <span className="sidebar-item-label">{t('nav.settings')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
