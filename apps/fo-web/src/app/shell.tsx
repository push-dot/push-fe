import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { AgentMark, Icon } from '../shared/ui/icon'
import { sessionStore } from '../shared/auth/session'
import { useSession } from '../shared/auth/use-session'
import { isAuthChrome } from './auth-chrome'
import { AUTH_BIZ, AUTH_LOGOUT, BRAND, FOOTER_LINKS, FOOTER_MARK, NAV, SEARCH_PLACEHOLDER } from './constants'
import AccountMenu from './account-menu'
import { EMPLOYER_LINKS, topEndLinks } from './shell-links'
import TabBar from './tab-bar'
import { tabBarShown } from './tab-items'
import { useNotifications } from '../entities/notification'
import { useOffers } from '../entities/offer'
import NotificationBell from '../pages/notifications/notification-bell'


const MAIN_NAV = [
  { to: '/', label: NAV.home, end: true, lock: false },
  { to: '/jobs', label: NAV.jobs, end: false, lock: false },
  { to: '/hub', label: NAV.hub, end: false, lock: true },
  { to: '/social', label: NAV.social, end: false, lock: true },
] as const

const navOn = (pathname: string, to: string) => {
  if (to === '/') return pathname === '/'
  if (to === '/jobs') return pathname.startsWith('/jobs') || pathname.startsWith('/postings')
  if (to === '/hub') return pathname.startsWith('/hub') || pathname.startsWith('/profiles')
  if (to === '/social') return pathname.startsWith('/social') || pathname.startsWith('/posts')
  return pathname === to || pathname.startsWith(`${to}/`)
}

const Shell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useSession()
  const auth = isAuthChrome(location.pathname)
  const queryText = new URLSearchParams(location.search).get('q') ?? ''
  const [searchDraft, setSearchDraft] = useState(queryText)
  useEffect(() => {
    setSearchDraft(queryText)
  }, [queryText])
  const employer = session?.user.accountType === 'EMPLOYER'
  const chatScreen = !auth && location.pathname.startsWith('/employer/chat')
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => {
    navRef.current?.querySelector('a.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const strip = document.querySelector<HTMLElement>('.side')
    const on = strip?.querySelector<HTMLElement>('.side-link.on')
    if (strip && on && strip.scrollWidth > strip.clientWidth) strip.scrollLeft = on.offsetLeft - strip.offsetLeft - (strip.clientWidth - on.offsetWidth) / 2
  }, [location.pathname, location.search, employer])
  const end = topEndLinks(Boolean(session))
  const live = Boolean(session) && !auth
  const notes = useNotifications(live)
  const received = useOffers('received', live)
  const unread = notes.data?.data.filter((item) => !item.readAt).length ?? 0
  const offerCount = received.data?.data.filter((item) => item.status === 'SENT').length ?? 0
  const tabs = !auth && tabBarShown(location.pathname)
  const shellClass = ['shell', 'browser', auth ? 'auth-shell' : '', chatScreen ? 'chat-screen' : '', tabs ? 'has-tabs' : ''].filter(Boolean).join(' ')
  return (
    <div className={shellClass}>
      {auth ? (
        <header className="auth-bar">
          <NavLink to="/" end className="auth-logo">
            {BRAND.slice(0, -1)}
            <i>{BRAND.slice(-1)}</i>
          </NavLink>
          {location.pathname === '/employer/verify' && employer && session ? (
            <>
              <span className="auth-biz">{AUTH_BIZ}</span>
              <span className="auth-session">
                <span>{session.user.displayName}</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    sessionStore.clear()
                    navigate('/')
                  }}
                >
                  {AUTH_LOGOUT}
                </button>
              </span>
            </>
          ) : null}
        </header>
      ) : (
        <header className="hd">
          <div className="wrap">
            <NavLink to="/" end className="wordmark">
              {BRAND.slice(0, -1)}
              <i>{BRAND.slice(-1)}</i>
            </NavLink>
            <nav className="nav" ref={navRef}>
              {MAIN_NAV.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={() => (navOn(location.pathname, link.to) ? 'on' : '')}>
                  {link.label}
                  {!session && link.lock ? (
                    <svg className="ic lock" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Zm2-.2V7.5a3.5 3.5 0 0 1 7 0v2.8" />
                    </svg>
                  ) : null}
                </NavLink>
              ))}
              {employer
                ? EMPLOYER_LINKS.map((link) => (
                    <NavLink key={link.to} to={link.to} className={() => (navOn(location.pathname, link.to) ? 'on' : '')}>
                      {link.to === '/employer/chat' ? <AgentMark /> : null}
                      {link.label}
                    </NavLink>
                  ))
                : null}
            </nav>
            {end.some((link) => link.to === '/search') ? (
              <form
                className="sbox"
                role="search"
                onSubmit={(event: FormEvent) => {
                  event.preventDefault()
                  const next = new URLSearchParams()
                  const term = searchDraft.trim()
                  if (term) next.set('q', term)
                  const type = new URLSearchParams(location.search).get('type')
                  if (type && location.pathname === '/search') next.set('type', type)
                  const search = next.toString()
                  navigate(search ? `/search?${search}` : '/search')
                }}
              >
                <button type="submit" className="sbox-go" aria-label={NAV.search}>
                  <Icon name="search" size={20} width={2.2} />
                </button>
                <input aria-label={NAV.search} placeholder={SEARCH_PLACEHOLDER} value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} />
              </form>
            ) : null}
            <div className="hd-end">
              {end.some((link) => link.to === '/notifications') ? <NotificationBell unread={unread} /> : null}
              {session ? (
                <NavLink to="/offers" className="hbtn" aria-label={offerCount > 0 ? `${NAV.offers} ${offerCount}개` : NAV.offers}>
                  <Icon name="inbox" size={22} />
                  {offerCount > 0 ? <span className="nb">{offerCount}</span> : null}
                </NavLink>
              ) : null}
              {session ? (
                <AccountMenu />
              ) : (
                <>
                  <NavLink to="/login" className="btn sec sm">
                    {NAV.login}
                  </NavLink>
                  <NavLink to="/signup" className="btn pri sm">
                    {NAV.signup}
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </header>
      )}
      <div className="shell-main">
        <Outlet />
      </div>
      {auth || chatScreen ? null : (
        <footer className="ft">
          <div className="wrap">
            <span className="wordmark">
              {BRAND.slice(0, -1)}
              <i>{BRAND.slice(-1)}</i>
            </span>
            {FOOTER_LINKS.map((link) =>
              'to' in link ? (
                <Link key={link.label} to={link.to} className={link.to === '/privacy' ? 'w7' : undefined}>
                  {link.label}
                </Link>
              ) : (
                <span key={link.label}>{link.label}</span>
              ),
            )}
            <span className="ft-mark">{FOOTER_MARK}</span>
          </div>
        </footer>
      )}
      {tabs ? <TabBar kind={!session ? 'guest' : employer ? 'employer' : 'personal'} /> : null}
    </div>
  )
}

export default Shell
