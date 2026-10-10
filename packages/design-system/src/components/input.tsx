import { Input as MantineInput, Textarea as MantineTextarea } from '@mantine/core'
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
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

const Textarea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <MantineTextarea
    className={[input({ textarea: true }), className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  />
)

const Select = ({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={[input(), className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  />
)

export { Input, Textarea, Select }
