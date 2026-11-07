import { StatusNote, emptyNoteStyle } from '@/shared/components'

type Props = { text: string; action?: string; onAction?: () => void; lift?: number }

const Empty = ({ text, action, onAction, lift = 140 }: Props) => (
  <StatusNote
    lines={[text]}
    action={action && onAction ? { label: action, onPress: onAction } : undefined}
    style={emptyNoteStyle(lift, false)}
  />
)

export default Empty
