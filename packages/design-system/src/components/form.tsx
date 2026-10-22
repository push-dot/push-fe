import type { ReactNode } from 'react'
import { form } from '../styles.css'

const Form = ({ children }: { children: ReactNode }) => <div className={form}>{children}</div>

export default Form
