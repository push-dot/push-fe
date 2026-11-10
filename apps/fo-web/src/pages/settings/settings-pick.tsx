import { Icon } from '../../shared/ui/icon'

type Option<T extends string> = { key: T; label: string }

const SettingsPick = <T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Option<T>[]; onChange: (next: T) => void }) => (
  <span className="chip set-pick">
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((item) => (
        <option key={item.key} value={item.key}>
          {item.label}
        </option>
      ))}
    </select>
    <Icon name="down" size={16} width={2.2} />
  </span>
)

export default SettingsPick
