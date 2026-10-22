import type { ReactNode } from 'react'
import { formRow, formRowHint, formRowLabel } from '../styles.css'

const FormRow = ({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children?: ReactNode
}) => (
  <div className={formRow}>
    <span className={formRowLabel}>{label}</span>
    {children ?? (hint ? <span className={formRowHint}>{hint}</span> : null)}
  </div>
)

export default FormRow
