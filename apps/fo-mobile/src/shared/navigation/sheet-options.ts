import type { NativeStackNavigationOptions } from 'expo-router'
import { Platform } from 'react-native'
import { radius, type Colors } from '../../theme'

export type SheetDetents = NativeStackNavigationOptions['sheetAllowedDetents']

// iOS keeps the system corner: on iOS 26 a partial-detent sheet floats inset with concentric corners, the native form of `.ios .sheet2`.
export const sheetOptions = (c: Colors, detents: SheetDetents = 'fitToContents'): NativeStackNavigationOptions => {
  const android = Platform.OS === 'android'
  return {
    presentation: 'formSheet',
    headerShown: false,
    sheetAllowedDetents: detents,
    sheetGrabberVisible: true,
    sheetCornerRadius: android ? radius.sheetTop : undefined,
    contentStyle: { backgroundColor: android ? c.bg : 'transparent' },
  }
}
