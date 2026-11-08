import { brandColor } from '@push/shared'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useMyCompany } from '../entities/company'
import { useAuthMe } from '../entities/session'
import { sessionStore } from '../shared/auth/session'
import { useSession } from '../shared/auth/use-session'
import { initials } from '../shared/lib/format'
import { PLAN_NAME, ROLE_NAME } from '../shared/model/employer-plan'
import { Icon } from '../shared/ui/icon'
import { Menu, Popover, type MenuItem } from '../shared/ui/popover'
import { ACCOUNT_MENU, NAV } from './constants'

const AccountMenu = () => {
  const session = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const employer = session?.user.accountType === 'EMPLOYER'
  const company = useMyCompany({ enabled: employer && Boolean(session?.user.companyId) })
  const me = useAuthMe(open)
  if (!session) return null
  const person = session.user.displayName
  const name = employer ? company.data?.name || person : person
  const plan = company.data?.plan
  const role = company.data?.role ?? session.user.companyRole
  const roleText = role === 'ADMIN' || role === 'MEMBER' ? ROLE_NAME[role] : null
  const chipSub = [plan ? PLAN_NAME[plan] : null, roleText].filter(Boolean).join(' · ')
  const email = me.data?.email
  const menuSub = employer ? [person !== name ? person : null, roleText, email].filter(Boolean).join(' · ') : email
  const mark = employer ? [...name][0] ?? '' : initials(name)
  const close = () => setOpen(false)
  const items: MenuItem[] = [
    { divider: true },
    ...(employer
      ? [
          { label: ACCOUNT_MENU.company, icon: 'company', to: '/me?tab=company' },
          { label: ACCOUNT_MENU.members, icon: 'people', to: '/employer/members' },
          { label: ACCOUNT_MENU.plans, icon: 'card', to: '/employer/plans' },
        ]
      : [
          { label: NAV.my, icon: 'user', to: '/me' },
          { label: ACCOUNT_MENU.settings, icon: 'gear', to: '/settings' },
        ]),
    { divider: true },
    {
      label: ACCOUNT_MENU.logout,
      icon: 'logout',
      onSelect: () => {
        sessionStore.clear()
        navigate('/')
      },
    },
  ] as MenuItem[]
  return (
    <div className="acct">
      <button
        type="button"
        className={employer ? 'me-chip biz' : 'me-chip'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={employer ? [name, chipSub, ACCOUNT_MENU.label].filter(Boolean).join(' · ') : `${NAV.my} · ${ACCOUNT_MENU.label}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={employer ? 'av biz-mark' : 'av hd-av'} style={{ background: brandColor(name || 'Push') }}>
          {mark}
        </span>
        {employer ? (
          <span className="biz-id">
            <span className="c1 w7">{name}</span>
            {chipSub ? <span className="c2 t3">{chipSub}</span> : null}
          </span>
        ) : null}
        <Icon name="down" size={16} width={2.2} />
      </button>
      {open ? (
        <Popover label={ACCOUNT_MENU.label} onClose={close} className="acct-pop">
          <div className="acct-head">
            <span className={employer ? 'av biz-mark' : 'av hd-av'} style={{ background: brandColor(name || 'Push') }}>
              {mark}
            </span>
            <span>
              <span className="b2 w7">{name}</span>
              {menuSub ? <span className="c1 t3 cap">{menuSub}</span> : null}
            </span>
          </div>
          <Menu items={items} onClose={close} />
        </Popover>
      ) : null}
    </div>
  )
}

export default AccountMenu
