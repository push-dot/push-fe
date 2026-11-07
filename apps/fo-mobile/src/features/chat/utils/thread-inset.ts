import { spacing } from '../../../theme/tokens'

// The design leaves 43-58pt (iOS) and ~33pt (Android) between the last thread line and an approval sheet.
const APPROVAL_GAP = { ios: 50, android: 32 }
const KEYBOARD_GAP = spacing[2]
const THREAD_GAP = spacing[4]

type Inset = { bottomH: number; keyboard: number; navBar: number; approval: boolean; android: boolean }

/** Android reports the keyboard without the nav bar, but KeyboardAvoidingView lifts the composer by both. */
export const threadInset = ({ bottomH, keyboard, navBar, approval, android }: Inset) => {
  const lift = keyboard && android ? keyboard + navBar : keyboard
  return bottomH + lift + (approval ? APPROVAL_GAP[android ? 'android' : 'ios'] : keyboard ? KEYBOARD_GAP : THREAD_GAP)
}
