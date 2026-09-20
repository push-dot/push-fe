import { useCallback, useEffect, useState } from 'react'
import { assignInlineVars } from '@vanilla-extract/dynamic'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { menuX, menuY } from '@pushdot/design'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import { Icon, IconButton, showToast } from '@/shared/components'
import type { IconName } from '@/shared/components'
import {
  isProjectConversation,
  useArchiveConversation,
  useConversations,
  useCreateConversation,
  usePatchConversation,
} from '@/features/chat'
import { listMessages } from '@/features/chat'
import type { Conversation } from '@/features/chat'
import { useMessagesStore } from '@/features/chat'

const NAV_ITEMS: { to: string; icon: IconName; labelKey: MsgKey }[] = [
  { to: ROUTES.documents, icon: 'file-text', labelKey: 'nav.documents' },
  { to: ROUTES.applications, icon: 'briefcase', labelKey: 'nav.applications' },
  { to: ROUTES.vault, icon: 'archive', labelKey: 'nav.vault' },
  { to: ROUTES.interview, icon: 'mic', labelKey: 'nav.interview' },
  { to: ROUTES.calendar, icon: 'calendar', labelKey: 'nav.calendar' },
]

const NEW_CHAT_TITLES = new Set(['새 채팅', 'New chat'])

const IS_MAC = /mac/i.test(navigator.platform)
const MOD = IS_MAC ? '⌘' : 'Ctrl+'

const SIDEBAR_MIN_W = 180
const SIDEBAR_MAX_W = 340
const SIDEBAR_W_KEY = 'push-sidebar-w'

const storedWidth = (): number => {
  const w = Number(localStorage.getItem(SIDEBAR_W_KEY))
  return w >= SIDEBAR_MIN_W && w <= SIDEBAR_MAX_W ? w : 220
}

type MenuState = { conv: Conversation; x: number; y: number }

const Sidebar = () => {
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [peek, setPeek] = useState(false)
  const [width, setWidth] = useState(storedWidth)
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: conversations = [] } = useConversations()
  const createConversation = useCreateConversation()
  const archiveConversation = useArchiveConversation()
  const patchConversation = usePatchConversation()
  const creating = createConversation.isPending
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

  const startResize = (e: ReactMouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = width
    const onMove = (ev: MouseEvent) => {
      const next = Math.min(SIDEBAR_MAX_W, Math.max(SIDEBAR_MIN_W, startW + ev.clientX - startX))
      setWidth(next)
    }
    const onUp = (ev: MouseEvent) => {
      const next = Math.min(SIDEBAR_MAX_W, Math.max(SIDEBAR_MIN_W, startW + ev.clientX - startX))
      localStorage.setItem(SIDEBAR_W_KEY, String(next))
      document.body.classList.remove('is-resizing')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    document.body.classList.add('is-resizing')
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const activeChatId = location.pathname.startsWith('/chat/')
    ? location.pathname.split('/')[2]
    : null

  const newChat = useCallback(async () => {
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
  }, [conversations, createConversation, creating, navigate, t])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'b' && !e.shiftKey) {
        e.preventDefault()
        setCollapsed((v) => !v)
        setPeek(false)
      } else if (k === 'o' && e.shiftKey) {
        e.preventDefault()
        void newChat()
      } else if (e.key === ',') {
        e.preventDefault()
        navigate(ROUTES.settings)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [newChat, navigate])

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
      {collapsed ? <div className="sidebar-edge" onMouseEnter={() => setPeek(true)} /> : null}
      <aside
        className={collapsed ? `sidebar is-hidden${peek ? ' is-peek' : ''}` : 'sidebar'}
        style={collapsed ? undefined : { width }}
        onMouseLeave={() => {
          if (collapsed) setPeek(false)
        }}
      >
        <div className="sidebar-head">
          <span className="t-label">Push</span>
          <IconButton
            icon={collapsed ? 'panel-left-open' : 'panel-left-close'}
            aria-label={collapsed ? t('nav.pinSidebar') : t('nav.collapseSidebar')}
            title={`${collapsed ? t('nav.pinSidebar') : t('nav.collapseSidebar')} (${MOD}B)`}
            onClick={() => {
              setCollapsed((v) => !v)
              setPeek(false)
            }}
          />
        </div>
        <div className="sidebar-scroll">
          <div className="sidebar-section">
            <div className="sidebar-label">{t('nav.chat')}</div>
            <button
              type="button"
              className="sidebar-item"
              title={`${t('nav.newChat')} (${MOD}⇧O)`}
              onClick={() => void newChat()}
            >
              <Icon name="square-pen" size={20} />
              <span className="sidebar-item-label">{t('nav.newChat')}</span>
            </button>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={c.id === activeChatId ? 'sidebar-item is-active' : 'sidebar-item'}
                onClick={() => navigate(ROUTES.chat(c.id))}
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
            title={`${t('nav.settings')} (${MOD},)`}
            onClick={() => navigate(ROUTES.settings)}
          >
            <Icon name="settings" size={20} />
            <span className="sidebar-item-label">{t('nav.settings')}</span>
          </button>
        </div>
        {!collapsed ? (
          <div className="sidebar-resizer" onMouseDown={startResize} aria-hidden="true" />
        ) : null}
      </aside>
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

export default Sidebar
