import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { button } from '../recipes.css'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  selected?: boolean
  icon?: ReactNode
}

const Button = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  selected = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) => {
  const classes = [button({ variant, size, selected, loading }), className ?? '']
    .filter(Boolean)
    .join(' ')
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {children}
      {icon}
    </button>
  )
}

export default Button
