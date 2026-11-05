import { Platform, View } from 'react-native'
import { Glass, Icon } from '@/shared/components'
import { radius } from '../../../theme'

const SIZE = 44

const MoreButton = () => {
  const icon = <Icon name="menu" size={22} color="t1" />
  if (Platform.OS === 'android')
    return <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
  return (
    <Glass interactive style={{ width: SIZE, height: SIZE, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Glass>
  )
}

export default MoreButton
