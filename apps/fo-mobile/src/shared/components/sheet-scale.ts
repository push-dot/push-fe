const FLOAT_INSET = 8

/**
 * iOS 26 floats a partial sheet 8pt in from each screen edge on home-indicator phones and draws the window-wide content scaled
 * down to fit (on device a 100pt box drew 96pt at 402pt, 386/402). Returns the width to lay the content out at and the scale
 * that brings it back to design size. Older iOS, home-button phones and a sheet attached for the keyboard (probed: drawn 1:1, full
 * width) need no scale.
 */
export const floatingSheet = (windowWidth: number, iosVersion: string | number, homeInset: number, keyboardUp: boolean) =>
  parseInt(String(iosVersion), 10) >= 26 && homeInset > 0 && !keyboardUp
    ? { width: windowWidth - 2 * FLOAT_INSET, scale: windowWidth / (windowWidth - 2 * FLOAT_INSET) }
    : null
