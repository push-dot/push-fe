import { useEffect, useState } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { useColors, type Colors } from '../../theme'

const SPIN_MS = 1000

/** Design arc spinner: 16-unit ring, quarter arc, 1s linear turn. iOS has no native arc spinner. */
const Spinner = ({ size = 12, color = 'acText' }: { size?: number; color?: keyof Colors }) => {
  const stroke = useColors()[color]
  const [turn] = useState(() => new Animated.Value(0))
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(turn, { toValue: 1, duration: SPIN_MS, easing: Easing.linear, useNativeDriver: true }))
    loop.start()
    return () => loop.stop()
  }, [turn])
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 16 16">
        <Circle cx={8} cy={8} r={6} fill="none" stroke={stroke} strokeOpacity={0.25} strokeWidth={2} />
        <Path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    </Animated.View>
  )
}

export default Spinner
