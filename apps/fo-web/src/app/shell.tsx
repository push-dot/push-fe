import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { brandOf, initials } from '../format'
import { sessionStore } from '../shared/auth/session'
import { useSession } from '../shared/auth/use-session'
import { isAuthChrome } from './auth-chrome'
import { AUTH_BIZ, AUTH_LOGOUT, BRAND, FOOTER_LINKS, FOOTER_MARK, NAV, SEARCH_PLACEHOLDER } from './constants'
import EmployerChip from './employer-chip'
import { EMPLOYER_LINKS, topEndLinks } from './shell-links'

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
  const end = topEndLinks(Boolean(session))
  const notes = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.me.webNotifications(),
    enabled: Boolean(session) && !auth,
  })
  const received = useQuery({
    queryKey: ['offers', 'received'],
    queryFn: () => api.me.offers('received'),
    enabled: Boolean(session) && !auth,
  })
  const unread = notes.data?.data.filter((item) => !item.readAt).length ?? 0
  const offerCount = received.data?.data.filter((item) => item.status === 'SENT').length ?? 0
  return (
    <div className={auth ? 'shell browser auth-shell' : chatScreen ? 'shell browser chat-screen' : 'shell browser'}>
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
            <NavLink to="/" end className="logo">
              {BRAND.slice(0, -1)}
              <i>{BRAND.slice(-1)}</i>
            </NavLink>
            <nav className="nav">
              {MAIN_NAV.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={() => (navOn(location.pathname, link.to) ? 'on' : '')}>
                  {link.label}
                  {!session && link.lock ? (
                    <svg className="ic lock" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="6" y="11" width="12" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  ) : null}
                </NavLink>
              ))}
              {employer
                ? EMPLOYER_LINKS.map((link) => (
                    <NavLink key={link.to} to={link.to} className={() => (navOn(location.pathname, link.to) ? 'on' : '')}>
                      {link.to === '/employer/chat' ? (
                        <svg className="ic spark" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M11 3c.6 4 2.7 6.1 6.7 6.7-4 .6-6.1 2.7-6.7 6.7-.6-4-2.7-6.1-6.7-6.7C8.3 9.1 10.4 7 11 3ZM18.5 14.5c.3 2 1.2 2.9 3 3.2-1.8.3-2.7 1.2-3 3.2-.3-2-1.2-2.9-3-3.2 1.8-.3 2.7-1.2 3-3.2Z" />
                        </svg>
                      ) : null}
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
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.2-3.2" />
                </svg>
                <input aria-label={NAV.search} placeholder={SEARCH_PLACEHOLDER} value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} />
              </form>
            ) : null}
            <div className="hd-end">
              {end
                .filter((link) => link.to === '/notifications')
                .map((link) => (
                  <NavLink key={link.to} to={link.to} className="hbtn" aria-label={unread > 0 ? `${link.label} ${unread}개` : link.label}>
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 7H4s2 0 2-7" />
                      <path d="M10 19a2 2 0 0 0 4 0" />
                    </svg>
                    {unread > 0 ? <span className="nb">{unread}</span> : null}
                  </NavLink>
                ))}
              {session ? (
                <NavLink to="/offers" className="hbtn" aria-label={offerCount > 0 ? `${NAV.offers} ${offerCount}개` : NAV.offers}>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 6h16v12H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                  {offerCount > 0 ? <span className="nb">{offerCount}</span> : null}
                </NavLink>
              ) : null}
              {session && employer ? (
                <EmployerChip />
              ) : session ? (
                <NavLink to="/me" className="me-chip" aria-label={NAV.my}>
                  <span className="av hd-av" style={{ background: brandOf(session.user.displayName) }}>
                    {initials(session.user.displayName)}
                  </span>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </NavLink>
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
            <span className="logo">
              {BRAND.slice(0, -1)}
              <i>{BRAND.slice(-1)}</i>
            </span>
            {FOOTER_LINKS.map((label) => (
              <span key={label} className={label === '개인정보 처리방침' ? 'w7' : undefined}>
                {label}
              </span>
            ))}
            <span className="ft-mark">{FOOTER_MARK}</span>
          </div>
        </footer>
      )}
    </div>
  )
}

export default Shell
