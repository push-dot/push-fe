import { StatusNote, emptyNoteStyle } from '@/shared/components'

type Props = { text: string; action?: string; onAction?: () => void; lift?: number; homeInset?: boolean }

const Empty = ({ text, action, onAction, lift = 140, homeInset = true }: Props) => (
  <StatusNote
    lines={[text]}
    action={action && onAction ? { label: action, onPress: onAction } : undefined}
    style={emptyNoteStyle(lift, homeInset)}
  />
)

export default Empty
