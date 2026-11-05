import type { ButtonProps } from '@expo/ui/swift-ui'
import type { ReactElement } from 'react'
import type { PressableProps } from 'react-native'

export type MenuAction = {
  key: string
  label: string
  onPress: () => void
  /** SF Symbol shown on iOS only. */
  systemImage?: ButtonProps['systemImage']
  destructive?: boolean
  selected?: boolean
}

export type MenuProps = {
  actions: MenuAction[]
  accessibilityLabel: string
  children: ReactElement
  /** iOS: the trigger takes the parent's width (a full settings row) instead of its own. */
  stretch?: boolean
  /** Android: grows a small trigger's touch area without growing the row. iOS: the UIMenu owns the tap and ignores it. */
  hitSlop?: PressableProps['hitSlop']
}

export type ContextMenuProps = MenuProps & { onPress?: () => void; preview?: ReactElement }
