const SettingsSwitch = ({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: (next: boolean) => void }) => (
  <label className="set-row switch-row">
    <span className="set-copy">
      <span className="b1">{label}</span>
      {sub ? <span className="c1 t3">{sub}</span> : null}
    </span>
    <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </label>
)

export default SettingsSwitch
