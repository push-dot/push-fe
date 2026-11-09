import { useState } from 'react'
import { Icon } from '../../shared/ui/icon'
import { HIDE_PASSWORD, SHOW_PASSWORD } from './constants'

const AuthPasswordField = ({
  value,
  onChange,
  autoComplete,
  label,
  placeholder,
  hint,
  error,
}: {
  value: string
  onChange: (value: string) => void
  autoComplete: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string | null
}) => {
  const [visible, setVisible] = useState(false)
  const input = (
    <span className={error ? 'auth-control err' : 'auth-control'}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={label ? undefined : placeholder}
        required
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="auth-eye"
        aria-label={visible ? HIDE_PASSWORD : SHOW_PASSWORD}
        onClick={() => setVisible((current) => !current)}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={20} />
      </button>
    </span>
  )
  const note = error ? (
    <span className="auth-error" role="alert">
      {error}
    </span>
  ) : hint ? (
    <span className="auth-hint">{hint}</span>
  ) : null
  if (!label) {
    return (
      <>
        {input}
        {note}
      </>
    )
  }
  return (
    <label className="auth-block">
      <span className="auth-label">{label}</span>
      {input}
      {note}
    </label>
  )
}

export default AuthPasswordField
