import { brandOf } from '@push/shared'
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
    <span className="av biz-mark" style={{ background: brandOf(email) }}>
      {[...email][0]?.toUpperCase()}
    </span>
    <span className="member-copy">
      <span className="b2 w7">{email}</span>
    </span>
    <span className={admin ? 'badge ac' : 'badge grey'}>{roleLabel}</span>
    {self ? <span className="badge grey">{MEMBER_SELF}</span> : null}
    {showActions ? (
      <span className="member-actions">
        <button type="button" className="text-link" disabled={pending} onClick={onRemove}>
          {REMOVE_MEMBER}
        </button>
        <button type="button" className="text-link" disabled={pending} onClick={onTransfer}>
          {TRANSFER_ADMIN}
        </button>
      </span>
    ) : null}
  </li>
)

export default MemberRow
