import { View } from 'react-native'
import { Text } from '@/shared/components'
import { useColors } from '../../../theme'
import { fileKind } from '../utility'

const FileTile = ({ name, small }: { name: string; small?: boolean }) => {
  const c = useColors()
  const pdf = fileKind(name) === 'PDF'
  return (
    <View
      style={{
        width: small ? 30 : 40,
        height: small ? 36 : 48,
        borderRadius: 8,
        backgroundColor: pdf ? c.redSoft : c.acSoft,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: small ? 4 : 6,
      }}
    >
      <Text
        weight="800"
        style={{ fontSize: small ? 8 : 10, lineHeight: small ? 10 : 12, color: pdf ? c.red : c.ac }}
      >
        {fileKind(name)}
      </Text>
    </View>
  )
}

export default FileTile
