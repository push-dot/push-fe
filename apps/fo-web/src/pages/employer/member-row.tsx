import { brandColor } from '@push/shared'
import { MEMBER_SELF, REMOVE_MEMBER, TRANSFER_ADMIN } from './constants'

const MemberRow = ({
  email,
  roleLabel,
  admin,
  self,
  showActions,
  pending,
  onRemove,
  onTransfer,
}: {
  email: string
  roleLabel: string
  admin: boolean
  self: boolean
  showActions: boolean
  pending: boolean
  onRemove: () => void
  onTransfer: () => void
}) => (
  <li className="member-row">
    <span className="av" style={{ background: brandColor(email) }}>
      {[...email][0]?.toUpperCase()}
    </span>
    <span className="member-copy">
      <span className="b2 w7">{email}</span>
    </span>
    <span className={admin ? 'badge ac' : 'badge grey'}>{roleLabel}</span>
    <span className="member-end">
      {self ? <span className="c1 t3">{MEMBER_SELF}</span> : null}
      {showActions ? (
        <>
          <button type="button" className="btn sec sm" disabled={pending} onClick={onTransfer}>
            {TRANSFER_ADMIN}
          </button>
          <button type="button" className="btn sec sm member-remove" disabled={pending} onClick={onRemove}>
            {REMOVE_MEMBER}
          </button>
        </>
      ) : null}
    </span>
  </li>
)

export default MemberRow
