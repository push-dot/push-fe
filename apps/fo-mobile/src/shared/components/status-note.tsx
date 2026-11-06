import { Platform, View, type StyleProp, type ViewStyle } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import { spacing } from '../../theme'
import Button from './button'
import Text from './text'

type Props = {
  lines: readonly string[]
  action?: { label: string; onPress: () => void }
  style?: StyleProp<ViewStyle>
}

const EMPTY_NOTE_LIFT = 160

// The design centers the note in the full screen height; an iOS list ends above the home indicator, so the lift gives that inset back.
// The window inset, not the screen's: inside a tab the screen inset also counts the tab bar.
export const EMPTY_NOTE_STYLE = {
  flex: 1,
  justifyContent: 'center',
  paddingBottom: EMPTY_NOTE_LIFT - (Platform.OS === 'ios' ? (initialWindowMetrics?.insets.bottom ?? 0) : 0),
} as const

const StatusNote = ({ lines, action, style }: Props) => {
  return (
    <View style={[{ alignItems: 'center', paddingHorizontal: 40, gap: spacing[2] }, style]}>
      <Text v="b1" weight="700" color="t2" style={{ textAlign: 'center' }}>
        {lines.join('\n')}
      </Text>
      {action ? (
        <View style={{ marginTop: spacing[3] }}>
          <Button label={action.label} variant="secondary" size="pill" onPress={action.onPress} />
        </View>
      ) : null}
    </View>
  )
}

export default StatusNote
