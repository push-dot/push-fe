import { Icon } from '../../shared/ui/icon'

const VerifyField = ({
  label,
  hint,
  value,
  onChange,
  inputMode,
  autoComplete,
  invalid,
}: {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  inputMode?: 'numeric' | 'text'
  autoComplete?: string
  invalid?: boolean
}) => (
  <label className="auth-block">
    <span className="auth-label">{label}</span>
    <span className={invalid ? 'auth-control err' : 'auth-control'}>
      <input
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {invalid ? (
        <Icon name="warn" size={20} className="auth-warn" />
      ) : null}
    </span>
    {hint ? <span className="auth-hint">{hint}</span> : null}
  </label>
)

export default VerifyField
