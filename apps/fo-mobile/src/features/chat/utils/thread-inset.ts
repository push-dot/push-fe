import { spacing } from '../../../theme/tokens'

// Last thread line to sheet title, measured on 12 boards per platform against the design: median +4pt (iOS) / +2pt (Android) at 50 / 32.
const APPROVAL_GAP = { ios: 46, android: 30 }
const KEYBOARD_GAP = spacing[2]
const THREAD_GAP = spacing[4]

type Inset = { bottomH: number; keyboard: number; navBar: number; approval: boolean; android: boolean }

/** Android reports the keyboard without the nav bar, but KeyboardAvoidingView lifts the composer by both. */
export const threadInset = ({ bottomH, keyboard, navBar, approval, android }: Inset) => {
  const lift = keyboard && android ? keyboard + navBar : keyboard
  return bottomH + lift + (approval ? APPROVAL_GAP[android ? 'android' : 'ios'] : keyboard ? KEYBOARD_GAP : THREAD_GAP)
}
