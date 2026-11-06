import { CircularProgressIndicator } from '@expo/ui/jetpack-compose'
import { size as sizeModifier } from '@expo/ui/jetpack-compose/modifiers'
import { useColors, type Colors } from '../../theme'
import NativeHost from './native-host'

/** Android: Material 3 indeterminate arc, stroke scaled to the design's 2/16 ring. */
const Spinner = ({ size = 12, color = 'acText' }: { size?: number; color?: keyof Colors }) => {
  const stroke = useColors()[color]
  return (
    <NativeHost matchContents>
      <CircularProgressIndicator color={stroke} strokeWidth={(size * 2) / 16} modifiers={[sizeModifier(size, size)]} />
    </NativeHost>
  )
}

export default Spinner
