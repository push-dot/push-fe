import { useQuery } from '@tanstack/react-query'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { brandOf, initials, roleLabel } from '../../format'
import { useSession } from '../../shared/auth/use-session'
import { NAV } from '../../app/constants'
import {
  EMPLOYER_ACTIVITY_MENU,
  EMPLOYER_MENU,
  PERSONAL_ACTIVITY_MENU,
  PERSONAL_MENU,
} from './constants'

const MySide = () => {
  const session = useSession()
  const location = useLocation()
  const [params] = useSearchParams()
  const employer = session?.user.accountType === 'EMPLOYER'
  const menu = employer ? EMPLOYER_MENU : PERSONAL_MENU
  const activity = employer ? EMPLOYER_ACTIVITY_MENU : PERSONAL_ACTIVITY_MENU
  const profile = useQuery({ queryKey: ['me', 'profile'], queryFn: () => api.me.profile(), enabled: Boolean(session) && !employer })
  const received = useQuery({ queryKey: ['offers', 'received'], queryFn: () => api.me.offers('received'), enabled: Boolean(session) })
  const offerCount = received.data?.data.filter((item) => item.status === 'SENT').length ?? 0
  const tab = params.get('tab') ?? (employer ? 'company' : 'profile')
  const chip = params.get('chip') ?? activity[0]?.to.split('chip=')[1]
  const itemOn = (to: string) => {
    if (location.pathname !== '/me') return false
    const url = new URL(to, 'http://local')
    if ((url.searchParams.get('tab') ?? '') !== tab) return false
    const want = url.searchParams.get('chip')
    return want ? want === chip : true
  }
  const offersOn = location.pathname === '/offers' || location.pathname.startsWith('/offers/')
  const settingsOn = location.pathname === '/settings'
  const name = session?.user.displayName ?? ''
  const sub = profile.data ? roleLabel(profile.data.jobCategory, profile.data.tenureYears) : ''
  return (
    <nav className="side" aria-label={NAV.my}>
      <div className="who">
        <span className="av hd-av" style={{ background: brandOf(name || 'Push') }}>
          {name ? initials(name) : ''}
        </span>
        <span>
          <span className="b1 w7">{name}</span>
          {sub ? <span className="c1 t3">{sub}</span> : null}
        </span>
      </div>
      {menu.map((item) => (
        <NavLink key={item.to} to={item.to} className={() => (itemOn(item.to) ? 'side-link on' : 'side-link')}>
          {item.label}
        </NavLink>
      ))}
      <div className="side-label">내 활동</div>
      {activity.map((item) => (
        <NavLink key={item.to} to={item.to} className={() => (itemOn(item.to) ? 'side-link on' : 'side-link')}>
          {item.label}
        </NavLink>
      ))}
      <div className="side-hr" />
      <NavLink to="/offers" className={() => (offersOn ? 'side-link on' : 'side-link')}>
        {NAV.offers}
        {offerCount > 0 ? <span className="side-count">{offerCount}</span> : null}
      </NavLink>
      <NavLink to="/settings" className={() => (settingsOn ? 'side-link on' : 'side-link')}>
        설정
      </NavLink>
    </nav>
  )
}

export default MySide
