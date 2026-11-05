import { Pressable, View } from 'react-native'
import { Icon, Text } from '../../../shared/components'
import { onAccent, radius, spacing, useColors } from '../../../theme'
import Surface from './surface'

const FilterButton = ({ count, onPress }: { count: number; onPress: () => void }) => {
  const c = useColors()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count ? `필터 ${count}개 적용됨` : '필터'}
      onPress={onPress}
    >
      <Surface style={{ width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="filter" size={22} color={count ? c.acText : c.t1} />
      </Surface>
      {count ? (
        <View style={{ position: 'absolute', top: 4, right: 2, minWidth: 18, height: 18, paddingHorizontal: spacing[1], borderRadius: radius.pill, backgroundColor: c.ac, borderWidth: 2, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text v="c2" weight="800" style={{ color: onAccent }}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  )
}

export default FilterButton
