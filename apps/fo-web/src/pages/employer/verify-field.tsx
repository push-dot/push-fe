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
        <svg className="auth-warn" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l9 16H3z" />
          <path d="M12 10v4" />
          <path d="M12 16.5h.01" />
        </svg>
      ) : null}
    </span>
    {hint ? <span className="auth-hint">{hint}</span> : null}
  </label>
)

export default VerifyField
