import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import { Icon, IconButton } from '@/shared/components'
import type { IconName } from '@/shared/components'
import { prefetchDocuments } from '@/features/documents'
import { prefetchApplications } from '@/features/applications'
import { prefetchCareerEvidence } from '@/features/evidence'
import { prefetchInterviews } from '@/features/interviews'
import { prefetchCalendarEvents } from '@/features/calendar'
import ConversationList, { useNewChat } from './conversation-list'

const NAV_ITEMS: { to: string; icon: IconName; labelKey: MsgKey; prefetch: () => void }[] = [
  { to: ROUTES.documents, icon: 'file-text', labelKey: 'nav.documents', prefetch: prefetchDocuments },
  {
    to: ROUTES.applications,
    icon: 'briefcase',
    labelKey: 'nav.applications',
    prefetch: prefetchApplications,
  },
  { to: ROUTES.vault, icon: 'archive', labelKey: 'nav.vault', prefetch: prefetchCareerEvidence },
  { to: ROUTES.interview, icon: 'mic', labelKey: 'nav.interview', prefetch: prefetchInterviews },
  { to: ROUTES.calendar, icon: 'calendar', labelKey: 'nav.calendar', prefetch: prefetchCalendarEvents },
]

const IS_MAC = /mac/i.test(navigator.platform)
const MOD = IS_MAC ? '⌘' : 'Ctrl+'

const SIDEBAR_MIN_W = 180
const SIDEBAR_MAX_W = 340
const SIDEBAR_W_KEY = 'push-sidebar-w'

const storedWidth = (): number => {
  const w = Number(localStorage.getItem(SIDEBAR_W_KEY))
  return w >= SIDEBAR_MIN_W && w <= SIDEBAR_MAX_W ? w : 220
}

const Sidebar = () => {
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [peek, setPeek] = useState(false)
  const edgeRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(storedWidth)
  const location = useLocation()
  const navigate = useNavigate()
  const { newChat } = useNewChat()

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

  return (
    <>
      {collapsed ? (
        <div
          ref={edgeRef}
          className="sidebar-edge"
          onMouseEnter={() => setPeek(true)}
          onFocus={() => setPeek(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setCollapsed(false)
              setPeek(false)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={t('nav.pinSidebar')}
        />
      ) : null}
      <aside
        className={collapsed ? `sidebar is-hidden${peek ? ' is-peek' : ''}` : 'sidebar'}
        style={collapsed ? undefined : { width }}
        onMouseLeave={() => {
          if (collapsed) setPeek(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && collapsed && peek) {
            setPeek(false)
            edgeRef.current?.focus()
          }
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
          <ConversationList onNewChat={() => void newChat()} />
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
                onMouseEnter={item.prefetch}
                onFocus={item.prefetch}
                aria-current={location.pathname.startsWith(item.to) ? 'page' : undefined}
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
            aria-current={location.pathname === ROUTES.settings ? 'page' : undefined}
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
    </>
  )
}

export default Sidebar
