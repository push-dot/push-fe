import { Platform } from 'react-native'
import { platformTheme } from '../../theme'
import { toastOffsets } from './toast-store'

// The Android tab bar is the Material 3 NavigationBar (80dp above the inset on the emulator), not the 58 the artboards draw.
const M3_NAVIGATION_BAR = 80

export const TOAST_ABOVE = toastOffsets(Platform.OS === 'android' ? M3_NAVIGATION_BAR : platformTheme.tabBarHeight - platformTheme.safeBottom)
