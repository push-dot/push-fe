import { StyleSheet, View } from 'react-native'
import { Glass } from '@/shared/components'
import { radius } from '../../../theme'
import { ComposerBody, type ComposerProps } from './composer-body'

/** iOS: Liquid Glass box, 28px radius. The glass is a layer behind the controls, so a tap never hit-tests into the effect view. */
export const Composer = (p: ComposerProps) => {
  return (
    <View>
      <Glass interactive style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]} />
      <ComposerBody {...p} />
    </View>
  )
}
