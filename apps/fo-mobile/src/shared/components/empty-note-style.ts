import { Platform } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'

const HOME_INSET = Platform.OS === 'ios' ? (initialWindowMetrics?.insets.bottom ?? 0) : 0

/**
 * Fills the empty list and centers a StatusNote `lift` points above the screen middle, as the artboards' `padding: 0 40px <lift>px`.
 * The design centers in the full screen height, but an iOS list on a stack screen ends above the home indicator, so `homeInset` gives
 * that inset back (the window inset: the screen's inset also counts a tab bar). Tab-root lists run to the screen bottom: pass false.
 */
export const emptyNoteStyle = (lift: number, homeInset = true) => ({ flex: 1, justifyContent: 'center', paddingBottom: lift - (homeInset ? HOME_INSET : 0) }) as const
