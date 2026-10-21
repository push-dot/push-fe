import { Input as MantineInput } from '@mantine/core'
import type { InputHTMLAttributes } from 'react'
import { input } from '../styles.css'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  error?: boolean
}

const Input = ({ error, className, ...rest }: InputProps) => (
  <MantineInput
    className={[input({ error }), className ?? ''].filter(Boolean).join(' ')}
    error={error}
    aria-invalid={error || undefined}
    {...rest}
  />
)

export default Input
