import { Pressable, View } from 'react-native'
import { Icon, Text } from '../../../shared/components'
import TermCheckbox from './term-checkbox'
import { spacing, type } from '../../../theme'

type Props = { label: string; badge: string; required: boolean; detail: boolean; checked: boolean; onPress: () => void }

const TermRow = ({ label, badge, required, detail, checked, onPress }: Props) => (
  <Pressable
    accessibilityRole="checkbox"
    accessibilityLabel={`${badge} ${label}`}
    accessibilityState={{ checked }}
    onPress={onPress}
    style={{ minHeight: 48, paddingVertical: spacing[3], flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] }}
  >
    <TermCheckbox checked={checked} size={24} />
    <View style={{ flex: 1, minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
      <Text v="c1" weight="700" color={required ? 'acText' : 't3'} style={{ lineHeight: type.b1.lineHeight }}>
        {badge}
      </Text>
      <Text style={{ flex: 1, lineHeight: type.b1.lineHeight }}>{label}</Text>
    </View>
    {/* shortcut: the terms URLs aren't decided yet (see settings 약관 및 정책), so the chevron is drawn but not wired. */}
    {detail ? (
      <View style={{ width: 44, height: 44, marginVertical: -10, marginRight: -spacing[3], alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chev" size={18} color="t3" />
      </View>
    ) : null}
  </Pressable>
)

export default TermRow
