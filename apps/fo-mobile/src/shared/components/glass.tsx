import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AccessibilityInfo, Platform, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native'
import { useColors, useShadow, useThemeMode } from '../../theme'
import { toBoxShadow } from '../utility'

const glassAvailable = Platform.OS === 'ios' && isGlassEffectAPIAvailable()

export const useReduceTransparency = () => {
  const [on, setOn] = useState(false)
  useEffect(() => {
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setOn)
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setOn)
    return () => sub.remove()
  }, [])
  return on
}

/** Native glass inside a glass sheet draws nothing, so a glass control in a partial iOS sheet draws the board's glass colour instead. */
export const SheetSurface = createContext(false)

export const useGlassSurface = () => {
  const reduce = useReduceTransparency()
  const inSheet = useContext(SheetSurface)
  return glassAvailable && !reduce && !inSheet
}

/** The board's `--glass` laid over a sheet: white in light, the glass token in dark. Null outside an iOS sheet. */
export const useSheetGlassFill = () => {
  const c = useColors()
  const inSheet = useContext(SheetSurface)
  const dark = useThemeMode() === 'dark'
  return inSheet ? (dark ? c.glass : c.bg) : null
}

type Props = {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
  surface?: 'glass' | 'sheet'
  interactive?: boolean
  tint?: ColorValue
}

const Glass = ({ children, style, surface = 'glass', interactive, tint }: Props) => {
  const c = useColors()
  const boxShadow = toBoxShadow(useShadow().glass)
  const glass = useGlassSurface()
  const sheetFill = useSheetGlassFill()
  if (Platform.OS === 'android') return <View style={[{ backgroundColor: c.bg2 }, style]}>{children}</View>
  if (glass) {
    // An RN boxShadow stays at rest size while interactive glass grows on press, leaving a fixed disc inside it.
    return (
      <GlassView style={[interactive ? null : { boxShadow }, style]} glassEffectStyle="regular" tintColor={tint} isInteractive={interactive}>
        {children}
      </GlassView>
    )
  }
  return <View style={[{ boxShadow, backgroundColor: sheetFill ?? (glassAvailable ? c.bg2 : c[surface]) }, style]}>{children}</View>
}

export default Glass
