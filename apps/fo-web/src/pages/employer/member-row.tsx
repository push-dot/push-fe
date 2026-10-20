import { REMOVE_MEMBER, TRANSFER_ADMIN } from './constants'

const MemberRow = ({
  email,
  roleLabel,
  showActions,
  pending,
  onRemove,
  onTransfer,
}: {
  email: string
  roleLabel: string
  showActions: boolean
  pending: boolean
  onRemove: () => void
  onTransfer: () => void
}) => (
  <li className="activity-row">
    <div className="link-row">
      <span className="b1">{email}</span>
      <span className="badge grey">{roleLabel}</span>
    </div>
    {showActions ? (
      <div className="link-row">
        <button type="button" className="text-link" disabled={pending} onClick={onRemove}>
          {REMOVE_MEMBER}
        </button>
        <button type="button" className="text-link" disabled={pending} onClick={onTransfer}>
          {TRANSFER_ADMIN}
        </button>
      </div>
    ) : null}
  </li>
)

export default MemberRow
