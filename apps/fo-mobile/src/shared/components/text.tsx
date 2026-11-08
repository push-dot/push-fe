import { Platform, Text as RNText, type TextProps } from 'react-native'
import { fontFor, type, useColors, type Colors, type TypeName } from '../../theme'

// iOS ceils each Text node to the pixel grid; list rows of 3 Text nodes ran +1pt (3 x 1/3pt). A hair under the token keeps the box on the token.
const LINE_EPSILON = Platform.OS === 'ios' ? 0.01 : 0

type Props = TextProps & {
  v?: TypeName
  color?: keyof Colors
  weight?: '400' | '500' | '600' | '700' | '800'
}

const Text = ({ v = 'b2', color = 't1', weight, style, ...rest }: Props) => {
  const c = useColors()
  const t = type[v]
  return (
    <RNText
      {...rest}
      style={[
        { fontSize: t.fontSize, lineHeight: t.lineHeight - LINE_EPSILON, letterSpacing: t.letterSpacing, color: c[color] },
        fontFor(weight ?? t.weight),
        style,
      ]}
    />
  )
}

export default Text
