import { Platform, View } from 'react-native'
import { radius, spacing, useColors, useThemeMode } from '../../theme'
import Glass from './glass'
import GlassActionButton, { type GlassAction } from './glass-action'

export type { GlassAction }

/** `filled`: the design's solid `fill` icon chip with a 16pt glyph (sheet close buttons), on both platforms. */
const GlassButton = ({ actions, filled }: { actions: GlassAction[]; filled?: boolean }) => {
  const c = useColors()
  const dark = useThemeMode() === 'dark'
  const single = actions.length === 1
  const row = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: single ? 0 : spacing[1] }}>
      {actions.map((a) => (
        <GlassActionButton key={a.label} a={a} width={single ? 44 : 40} iconSize={filled ? 16 : 22} />
      ))}
    </View>
  )
  const shape = { borderRadius: radius.pill, minWidth: 44, height: 44, justifyContent: 'center' } as const
  if (filled) return <View style={[shape, { backgroundColor: c.fill, overflow: 'hidden' }]}>{row}</View>
  if (Platform.OS === 'android') return row
  return (
    <Glass interactive tint={dark ? c.glass : undefined} style={shape}>
      {row}
    </Glass>
  )
}

export default GlassButton
