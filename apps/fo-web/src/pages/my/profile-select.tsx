import type { ReactNode } from 'react'
import { Icon } from '../../shared/ui/icon'
import { PROFILE_FIELDS } from './constants'

type Option = { value: string; label: string }

type ProfileSelectProps = {
  label: string
  value: string
  options: Option[]
  display?: ReactNode
  onChange: (value: string) => void
}

const ProfileSelect = ({ label, value, options, display, onChange }: ProfileSelectProps) => (
  <label className="field">
    {label}
    <span className={display ? 'mp-select shown' : 'mp-select'}>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{PROFILE_FIELDS.unset}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {display ? <span className="mp-select-show">{display}</span> : null}
      <Icon name="down" size={18} className="mp-select-ic" />
    </span>
  </label>
)

export default ProfileSelect
