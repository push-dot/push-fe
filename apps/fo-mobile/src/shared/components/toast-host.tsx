import { useEffect, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Animated, Platform, Pressable, View, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { hitSlopTo, onAccent, palette, radius, spacing, type, useColors, useThemeMode } from '../../theme'
import { TOAST_BOTTOM_GAP } from './constants'
import Glass from './glass'
import Icon from './icon'
import Text from './text'
import { hideToast, toastDuration, useHostedToast, type ToastTone } from './toast-store'

const ANDROID_SHADOW = '0 8px 24px rgba(0,0,0,0.16)'
const SHAPE = { plain: { inset: spacing[4], radius: radius.md }, tone: { inset: spacing[5], radius: 18 } }

const ToneIcon = ({ tone }: { tone: ToastTone }) => {
  const c = useColors()
  return (
    <View
      style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: tone === 'success' ? c.green : c.red, alignItems: 'center', justifyContent: 'center' }}
    >
      {tone === 'success' ? (
        <Icon name="check" size={13} color={onAccent} />
      ) : (
        <Text v="c1" weight="800" style={{ color: onAccent }}>
          !
        </Text>
      )}
    </View>
  )
}

// Android's Material snackbar cannot take the drawn 16pt radius or 52pt height (@expo/ui Snackbar has no shape prop).
const Surface = ({ shape, children }: { shape: ViewStyle; children: ReactNode }) => {
  const c = useColors()
  if (Platform.OS === 'ios') return <Glass interactive style={shape}>{children}</Glass>
  return <View style={[shape, { backgroundColor: c.t1, boxShadow: ANDROID_SHADOW }]}>{children}</View>
}

const ToastHost = () => {
  const toast = useHostedToast()
  const insets = useSafeAreaInsets()
  const c = useColors()
  const inverse = palette[useThemeMode() === 'dark' ? 'light' : 'dark']
  const ink = Platform.OS === 'ios' ? { text: c.t1, action: c.acText } : { text: c.bg, action: inverse.acText }
  const [shown] = useState(() => new Animated.Value(0))
  useEffect(() => {
    if (!toast) return
    shown.setValue(0)
    Animated.spring(shown, { toValue: 1, useNativeDriver: true }).start()
    AccessibilityInfo.announceForAccessibility(toast.message)
    const timer = setTimeout(() => hideToast(toast.id), toastDuration(toast))
    return () => clearTimeout(timer)
  }, [toast, shown])
  if (!toast) return null
  const translateY = shown.interpolate({ inputRange: [0, 1], outputRange: [24, 0] })
  const shape = SHAPE[toast.tone ? 'tone' : 'plain']
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: shape.inset,
        right: shape.inset,
        bottom: insets.bottom + (toast.bottom ?? TOAST_BOTTOM_GAP),
        opacity: shown,
        transform: [{ translateY }],
      }}
    >
      <Surface shape={{ borderRadius: shape.radius }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 52, paddingHorizontal: spacing[4] }}>
          {toast.tone ? <ToneIcon tone={toast.tone} /> : null}
          <Text v="b2" weight="600" style={{ flex: 1, color: ink.text }}>
            {toast.message}
          </Text>
          {toast.action ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={hitSlopTo(type.b2.lineHeight)}
              onPress={() => {
                toast.action?.onPress()
                hideToast(toast.id)
              }}
            >
              <Text v="b2" weight="700" style={{ color: ink.action }}>
                {toast.action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Surface>
    </Animated.View>
  )
}

export default ToastHost
