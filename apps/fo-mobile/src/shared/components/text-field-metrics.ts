import { type } from '../../theme/tokens'

const MULTILINE_ROWS = 4

/** Android's EditText adds theme padding and font padding on every edge the style leaves unset (inputs drew ~64pt and clipped placeholders); zero both so heights come from our own metrics. */
export const inputReset = { padding: 0, includeFontPadding: false } as const

/** Multiline keeps the 24 line-height token and grows by rows; single line drops it (Android clipped glyphs at 1.3) and only scales its floor. */
export const inputMetrics = (multiline: boolean | undefined, fontScale: number) =>
  multiline
    ? { ...inputReset, lineHeight: type.b1.lineHeight, minHeight: MULTILINE_ROWS * type.b1.lineHeight * fontScale }
    : { ...inputReset, minHeight: type.b1.lineHeight * fontScale }
