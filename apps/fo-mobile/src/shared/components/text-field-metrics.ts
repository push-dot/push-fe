import { Platform } from 'react-native'
import { type } from '../../theme/tokens'

const MULTILINE_ROWS = 4

/** Android EditText adds theme and font padding where the style sets none (fields drew 64pt, placeholders clipped). */
export const inputReset = Platform.OS === 'android' ? ({ padding: 0, includeFontPadding: false } as const) : {}

/** Multiline keeps the 24 line-height token and grows by rows; single line drops it (Android clipped glyphs at 1.3) and only scales its floor. */
export const inputMetrics = (multiline: boolean | undefined, fontScale: number) =>
  multiline
    ? { ...inputReset, lineHeight: type.b1.lineHeight, minHeight: MULTILINE_ROWS * type.b1.lineHeight * fontScale }
    : { ...inputReset, minHeight: type.b1.lineHeight * fontScale }

/** iOS UITextView draws typed multiline text 6.6pt below the board's first line (placeholder is fine), measured on EditIntro at 16/25. */
export const IOS_TYPED_TEXT_RAISE = 6.6

export const typedTextShift = (multiline: boolean | undefined, typed: boolean, os: string = Platform.OS) =>
  os === 'ios' && multiline && typed ? { transform: [{ translateY: -IOS_TYPED_TEXT_RAISE }] } : undefined
