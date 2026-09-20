import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { input } from '../styles.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

const Input = ({ error, className, ...rest }: InputProps) => (
  <input
    className={[input({ error }), className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  />
)

const Textarea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
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
