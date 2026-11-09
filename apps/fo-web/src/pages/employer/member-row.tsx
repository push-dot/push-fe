import { brandColor } from '@push/shared'
import { useState, type ReactNode } from 'react'

import { Icon } from '../../shared/ui/icon'
import { Menu, Popover, type MenuItem } from '../../shared/ui/popover'
import { INVITE_PENDING, INVITE_PENDING_TITLE, INVITE_RESEND, INVITE_REVOKE, MEMBER_MORE, MEMBER_SELF, REMOVE_MEMBER, TRANSFER_ADMIN, memberInitials } from './constants'

const More = ({ items }: { items: MenuItem[] }) => {
  const [open, setOpen] = useState(false)
  return (
    <span className="member-more">
      <button type="button" className="hbtn" aria-label={MEMBER_MORE} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name="more" size={20} width={2.6} />
      </button>
      {open ? (
        <Popover label={MEMBER_MORE} onClose={() => setOpen(false)} className="member-pop">
          <Menu items={items} onClose={() => setOpen(false)} />
        </Popover>
      ) : null}
    </span>
  )
}

const Row = ({ avatar, title, sub, badge, children }: { avatar: ReactNode; title: ReactNode; sub: string; badge: ReactNode; children?: ReactNode }) => (
  <li className="member-row">
    {avatar}
    <span className="member-copy">
      {title}
      <span className="c1 t3">{sub}</span>
    </span>
    {badge}
    <span className="member-end">{children}</span>
  </li>
)

export const MemberRow = ({
  name,
  email,
  roleLabel,
  admin,
  self,
  busy,
  onRemove,
  onTransfer,
}: {
  name: string
  email: string
  roleLabel: string
  admin: boolean
  self: boolean
  busy: boolean
  /** Set only for an ADMIN looking at another member. */
  onRemove?: () => void
  onTransfer?: () => void
}) => (
  <Row
    avatar={
      <span className="av" style={{ background: brandColor(name) }}>
        {memberInitials(name)}
      </span>
    }
    title={<span className="b2 w7">{name}</span>}
    sub={email}
    badge={<span className={admin ? 'badge ac' : 'badge grey'}>{roleLabel}</span>}
  >
    {self ? <span className="c1 t3">{MEMBER_SELF}</span> : null}
    {onRemove ? (
      <button type="button" className="btn sec sm member-remove" disabled={busy} onClick={onRemove}>
        {REMOVE_MEMBER}
      </button>
    ) : null}
    {onTransfer ? <More items={[{ label: TRANSFER_ADMIN, icon: 'shield', onSelect: onTransfer }]} /> : null}
  </Row>
)

export const InviteRow = ({ expiry, busy, onResend, onRevoke }: { expiry: string; busy: boolean; onResend: () => void; onRevoke: () => void }) => (
  <Row
    avatar={
      <span className="av member-pending">
        <Icon name="mail" size={20} />
      </span>
    }
    title={<span className="b1 w7">{INVITE_PENDING_TITLE}</span>}
    sub={expiry}
    badge={<span className="badge orange">{INVITE_PENDING}</span>}
  >
    <button type="button" className="btn sec sm" disabled={busy} onClick={onResend}>
      {INVITE_RESEND}
    </button>
    <More items={[{ label: INVITE_REVOKE, icon: 'close', danger: true, onSelect: onRevoke }]} />
  </Row>
)
