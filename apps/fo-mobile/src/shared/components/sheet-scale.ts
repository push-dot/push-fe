const FLOAT_INSET = 8
const BOTTOM_PAD = 20

/**
 * iOS 26 floats a partial sheet 8pt in from each screen edge on home-indicator phones and draws the window-wide content scaled
 * down to fit (on device a 100pt box drew 96pt at 402pt, 386/402). Returns the width to lay the content out at and the scale
 * that brings it back to design size; older iOS and home-button phones draw 1:1. With the keyboard up the sheet attaches and
 * draws 1:1 too (probed), so only the scale drops: a layout change while typing would dismiss the keyboard.
 */
export const floatingSheet = (windowWidth: number, iosVersion: string | number, homeInset: number, keyboardUp: boolean) =>
  parseInt(String(iosVersion), 10) >= 26 && homeInset > 0
    ? { width: windowWidth - 2 * FLOAT_INSET, scale: keyboardUp ? 1 : windowWidth / (windowWidth - 2 * FLOAT_INSET) }
    : null

/**
 * Bottom margin for floating content of `height`, scaled up by `scale` from its top edge. UIKit sizes the sheet from the
 * unscaled height plus the home inset, so without it the CTA sat 29pt above the sheet edge instead of the artboard's 20
 * (DeleteCareer). It ignores the keyboard for the same reason the width does.
 */
export const floatingSheetMargin = (height: number, scale: number, homeInset: number) => (scale - 1) * height + BOTTOM_PAD * scale - homeInset
