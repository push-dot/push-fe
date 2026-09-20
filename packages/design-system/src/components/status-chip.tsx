import type { ReactNode } from 'react'
import { statusChip } from '../recipes.css'

export type StatusChipTone = 'ready' | 'running' | 'verified' | 'pending' | 'error'

export type StatusChipProps = {
  tone: StatusChipTone
  label: string
  icon?: ReactNode
}

const StatusChip = ({ tone, label, icon }: StatusChipProps) => (
  <span className={statusChip({ tone })}>
    {icon}
    {label}
  </span>
)

export default StatusChip
