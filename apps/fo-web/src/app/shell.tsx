import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { sessionStore } from '../shared/auth/session'
import { useSession } from '../shared/auth/use-session'
import { isAuthChrome } from './auth-chrome'
import { AUTH_BIZ, AUTH_LOGOUT, BRAND, NAV } from './constants'
import { topEndLinks } from './shell-links'

const Shell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useSession()
  const auth = isAuthChrome(location.pathname)
  const employer = session?.user.accountType === 'EMPLOYER'
  const links = session
    ? [
        { to: '/', label: NAV.home, end: true },
        { to: '/jobs', label: NAV.jobs, end: false },
        { to: '/hub', label: NAV.hub, end: false },
        { to: '/social', label: NAV.social, end: false },
        { to: '/me', label: NAV.my, end: true },
        ...(employer
          ? [
              { to: '/employer/postings', label: NAV.postings, end: false },
              { to: '/employer/chat', label: NAV.chat, end: false },
            ]
          : []),
      ]
    : [
        { to: '/', label: NAV.home, end: true },
        { to: '/jobs', label: NAV.jobs, end: false },
      ]
  return (
    <div className={auth ? 'shell browser auth-shell' : 'shell browser'}>
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
      ) : null}
      {auth ? null : (
        <header className="topbar">
          <NavLink to="/" end className="brand">
            {BRAND}
          </NavLink>
          <nav>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="top-end">
            {topEndLinks(Boolean(session)).map((link) => (
              <NavLink key={link.to} to={link.to} className="nav-link" aria-label={link.label}>
                {link.to === '/notifications' ? (
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 7H4s2 0 2-7" />
                    <path d="M10 19a2 2 0 0 0 4 0" />
                  </svg>
                ) : (
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.2-3.2" />
                  </svg>
                )}
              </NavLink>
            ))}
            {session ? (
              <span className="account">{session.user.displayName}</span>
            ) : (
              <NavLink to="/login" className="pill">
                {NAV.login}
              </NavLink>
            )}
          </div>
        </header>
      )}
      <div className="shell-main">
        <Outlet />
      </div>
    </div>
  )
}

export default Shell
