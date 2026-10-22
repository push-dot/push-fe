import type { ReactNode } from 'react'
import { formSection, formSectionTitle } from '../styles.css'

const FormSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className={formSection}>
    <div className={formSectionTitle}>{title}</div>
    {children}
  </div>
)

export default FormSection
