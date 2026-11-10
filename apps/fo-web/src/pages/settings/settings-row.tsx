import type { ReactNode } from 'react'

const SettingsRow = ({ label, sub, children }: { label: ReactNode; sub?: string; children?: ReactNode }) => (
  <div className="set-row">
    <span className="set-copy">
      <span className="b1">{label}</span>
      {sub ? <span className="c1 t3">{sub}</span> : null}
    </span>
    {children}
  </div>
)

export default SettingsRow
