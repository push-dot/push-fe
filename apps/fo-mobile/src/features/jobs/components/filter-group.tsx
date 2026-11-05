import type { ReactNode } from 'react'
import { View } from 'react-native'
import { space } from '../../../theme'
import { Text } from '../../../shared/components'

const FilterGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={{ gap: 10 }}>
    <Text v="b2" weight="700">
      {title}
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>{children}</View>
  </View>
)

export default FilterGroup
