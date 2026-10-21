import type { SelectHTMLAttributes } from 'react'
import { input } from '../styles.css'

const Select = ({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={[input(), className ?? ''].filter(Boolean).join(' ')} {...rest} />
)

export default Select
