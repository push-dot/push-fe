import type { ReactNode } from 'react'
import {
  form,
  formRow,
  formRowHint,
  formRowLabel,
  formSection,
  formSectionTitle,
} from '../styles.css'

const Form = ({ children }: { children: ReactNode }) => (
  <div className={form}>{children}</div>
)

const FormSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className={formSection}>
    <div className={formSectionTitle}>{title}</div>
    {children}
  </div>
)

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

export { Form, FormRow, FormSection }
