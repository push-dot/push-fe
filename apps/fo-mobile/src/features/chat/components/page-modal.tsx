import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassButton, Text } from '@/shared/components'
import { useColors } from '../../../theme'

/** Body of a sidebar page route presented as a native modal (iOS page sheet, Android full screen). */
const PageModal = ({
  onClose = () => router.back(),
  title,
  right,
  left,
  children,
  footer,
}: {
  onClose?: () => void
  title: string
  right?: ReactNode
  left?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) => {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const ios = Platform.OS === 'ios'
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: ios ? 14 : insets.top + 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 6 }}>
        {left ?? <GlassButton actions={[{ icon: 'x', label: '닫기', onPress: onClose }]} />}
        <Text v="h3" accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>
          {title}
        </Text>
        <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 + (footer ? 80 : 0) }}>{children}</ScrollView>
      {footer ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 14, paddingBottom: insets.bottom + 10, backgroundColor: c.bg }}>{footer}</View> : null}
    </View>
  )
}

export default PageModal
