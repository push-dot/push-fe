import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '../../../shared/components'
import { space } from '../../../theme'

const HubFilterGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={{ gap: space[3] }}>
    <Text v="b2" weight="700">
      {title}
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] }}>{children}</View>
  </View>
)

export default HubFilterGroup
