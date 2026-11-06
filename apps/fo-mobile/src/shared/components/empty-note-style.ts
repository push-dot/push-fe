import { Platform } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'

// The design centers the note in the full screen height, but an iOS list ends above the home indicator, so the lift gives that
// inset back. It is the window inset, not the screen's: inside a tab the screen inset also counts the tab bar.
const HOME_INSET = Platform.OS === 'ios' ? (initialWindowMetrics?.insets.bottom ?? 0) : 0

/** Fills the empty list and centers a StatusNote `lift` points above the screen middle, as the artboards' `padding: 0 40px <lift>px`. */
export const emptyNoteStyle = (lift: number) => ({ flex: 1, justifyContent: 'center', paddingBottom: lift - HOME_INSET }) as const
