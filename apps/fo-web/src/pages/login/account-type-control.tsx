import type { AccountType } from '../../shared/model/access'

const AccountTypeControl = ({
  value,
  onChange,
}: {
  value: AccountType
  onChange: (value: AccountType) => void
}) => (
  <div className="auth-seg" role="group" aria-label="계정 유형">
    <button type="button" aria-pressed={value === 'PERSONAL'} onClick={() => onChange('PERSONAL')}>
      개인
    </button>
    <button type="button" aria-pressed={value === 'EMPLOYER'} onClick={() => onChange('EMPLOYER')}>
      기업
    </button>
  </div>
)

export default AccountTypeControl
