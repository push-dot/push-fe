const THREAD_GAP = 16
// The design leaves 43-58pt between the last thread line and an approval sheet.
const APPROVAL_GAP = 50

export const threadInset = (bottomH: number, keyboard: number, approval: boolean) => bottomH + keyboard + (approval ? APPROVAL_GAP : THREAD_GAP)
