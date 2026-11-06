const FLOAT_INSET = 8

/**
 * iOS 26 floats a partial sheet 8pt in from each screen edge on home-indicator phones and draws the window-wide content scaled
 * down to fit (on device a 100pt box drew 96pt at 402pt, 386/402). Returns the width to lay the content out at and the scale
 * that brings it back to design size; older iOS and home-button phones attach the sheet and draw it 1:1.
 */
export const floatingSheet = (windowWidth: number, iosVersion: string | number, homeInset: number) =>
  parseInt(String(iosVersion), 10) >= 26 && homeInset > 0
    ? { width: windowWidth - 2 * FLOAT_INSET, scale: windowWidth / (windowWidth - 2 * FLOAT_INSET) }
    : null
