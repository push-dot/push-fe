import { colors, largeText, shadows, typography } from '@push/design-system'
import { nativeShadow } from './native-shadow'

export { fontWeights, radius, spacing } from '@push/design-system'

export const palette = colors

export type Colors = { [K in keyof typeof palette.light]: string }

export type Weight = '400' | '500' | '600' | '700' | '800'

type NativeType = { fontSize: number; lineHeight: number; weight: Weight; letterSpacing: number }

export const type = Object.fromEntries(
  Object.entries(typography).map(([name, t]) => [
    name,
    { fontSize: t.fontSize, lineHeight: t.lineHeight, weight: String(t.fontWeight) as Weight, letterSpacing: t.fontSize * t.letterSpacing },
  ]),
) as Record<keyof typeof typography, NativeType>

export type TypeName = keyof typeof type

/** Handoff "큰 글씨" sizes. The system font scale drives Text; these are the design's reference points. */
export const largeType = Object.fromEntries(
  Object.entries(largeText).map(([name, t]) => [
    name,
    { ...type[name as TypeName], fontSize: t.fontSize, lineHeight: t.lineHeight, letterSpacing: t.fontSize * typography[name as TypeName].letterSpacing },
  ]),
) as Record<keyof typeof largeText, NativeType>

const nativeShadows = (theme: { pop: string; glass: string }) => ({
  pop: nativeShadow(theme.pop),
  glass: nativeShadow(theme.glass),
})

export const shadow = { light: nativeShadows(shadows.light), dark: nativeShadows(shadows.dark) }
