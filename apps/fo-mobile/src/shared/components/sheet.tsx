import type { ReactNode } from 'react'
import { Platform, View, type ViewProps } from 'react-native'
import { SafeAreaProvider, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context'
import { spacing, useColors } from '../../theme'
import Button from './button'
import GlassButton from './glass-button'
import Text from './text'

type Props = {
  title?: string
  description?: string
  children: ReactNode
  action?: { label: string; onPress: () => void; disabled?: boolean }
  secondary?: { label: string; onPress: () => void }
  /** iOS only: a glass close button left of the title. Android closes by drag or back. */
  onClose?: () => void
  gap?: number
  onLayout?: ViewProps['onLayout']
}

const GRAB = { width: 36, height: 5, radius: 3 }
const SHEET_GAP = 14
// iOS 26 insets a floating sheet this far from each screen edge and draws the window-wide content scaled down to fit (probed: a 100pt box
// drew 96pt on a 402pt screen, 386/402), so the content is laid out at the sheet's width and scaled back up to land at design size.
const FLOAT_INSET = 8
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 }

const Body = ({ title, description, children, action, secondary, onClose, gap = SHEET_GAP, onLayout, homeInset = 0 }: Props & { homeInset?: number }) => {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const android = Platform.OS === 'android'
  const close = onClose && !android ? <GlassButton actions={[{ icon: 'x', label: '닫기', onPress: onClose }]} /> : null
  return (
    <View
      onLayout={onLayout}
      style={{
        paddingTop: android ? spacing[3] : spacing[3] + GRAB.height + gap,
        paddingHorizontal: android ? spacing[5] : spacing[4],
        paddingBottom: android ? insets.bottom + spacing[3] : insets.bottom || (homeInset ? 0 : spacing[5]),
        gap,
      }}
    >
      {android ? (
        <View style={{ width: GRAB.width, height: GRAB.height, borderRadius: GRAB.radius, backgroundColor: c.deco, alignSelf: 'center' }} />
      ) : null}
      {title || close ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
          {close}
          {title ? (
            <View style={{ flex: 1, gap: 2 }}>
              <Text v="h2" accessibilityRole="header">
                {title}
              </Text>
              {description ? (
                <Text v="b2" color="t3">
                  {description}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
      {children}
      {action ? <Button label={action.label} onPress={action.onPress} disabled={action.disabled} /> : null}
      {secondary ? <Button label={secondary.label} variant="secondary" onPress={secondary.onPress} /> : null}
    </View>
  )
}

// iOS 26 floats partial sheets clear of the home indicator and attaches large ones; a provider inside the sheet reads which.
// A floating sheet already sits one home inset above its content (DeleteCareer capture: CTA 31pt high with 20pt padding), so it pads only without a home indicator.
const IosSheet = (props: Props) => {
  const frame = useSafeAreaFrame()
  const { bottom } = useSafeAreaInsets()
  return (
    <SafeAreaProvider initialMetrics={{ frame, insets: NO_INSETS }} style={{ flex: 0 }}>
      <View style={{ width: frame.width - 2 * FLOAT_INSET, alignSelf: 'center', transform: [{ scale: frame.width / (frame.width - 2 * FLOAT_INSET) }] }}>
        <Body {...props} homeInset={bottom} />
      </View>
    </SafeAreaProvider>
  )
}

/** Body of a native form sheet route (see sheetOptions). iOS draws the grabber; Android gets the Material 3 drag handle. */
const Sheet = Platform.OS === 'android' ? Body : IosSheet

export default Sheet
