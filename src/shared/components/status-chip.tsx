import { statusChip } from '../../theme/recipes.css'
import Icon from './icon'
import type { IconName } from './icon'

export type StatusChipTone = 'ready' | 'running' | 'verified' | 'pending' | 'error'

type StatusChipProps = {
  tone: StatusChipTone
  label: string
  icon?: IconName
}

const StatusChip = ({ tone, label, icon }: StatusChipProps) => (
  <span className={statusChip({ tone })}>
    {icon ? <Icon name={icon} size={16} /> : null}
    {label}
  </span>
)

export default StatusChip
