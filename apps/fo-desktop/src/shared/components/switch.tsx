type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  'aria-label': string
}

const Switch = ({ checked, onChange, 'aria-label': ariaLabel }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    className={['switch', checked ? 'is-on' : ''].filter(Boolean).join(' ')}
    onClick={() => onChange(!checked)}
  >
    <span className="switch-thumb" />
  </button>
)

export default Switch
