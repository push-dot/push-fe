import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
}

const Input = ({ error, className, ...rest }: InputProps) => (
  <input
    className={['input', error ? 'is-error' : '', className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  />
)

const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="input input-textarea" {...props} />
)

const Select = ({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={['input', className ?? ''].filter(Boolean).join(' ')} {...rest} />
)

export { Input, Textarea, Select }
