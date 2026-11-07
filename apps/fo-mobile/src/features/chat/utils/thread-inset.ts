const THREAD_GAP = 16
// The design leaves 43-58pt between the last thread line and an approval sheet.
const APPROVAL_GAP = 50
// ChatKeyboardAndroid: the composer rides the keyboard and the thread keeps one 8pt step above it.
const KEYBOARD_GAP = 8

export const threadInset = (bottomH: number, keyboard: number, approval: boolean) =>
  bottomH + keyboard + (approval ? APPROVAL_GAP : keyboard ? KEYBOARD_GAP : THREAD_GAP)
