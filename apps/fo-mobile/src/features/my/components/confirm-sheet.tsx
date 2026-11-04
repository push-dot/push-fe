import { View } from 'react-native'
import { BottomSheet, Button, Text } from '@/shared/components'

type Props = {
  visible: boolean
  title: string
  body: string
  confirm: string
  cancel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}

const ConfirmSheet = ({ visible, title, body, confirm, cancel = '취소', danger, onConfirm, onClose }: Props) => (
  <BottomSheet visible={visible} onClose={onClose}>
    <View accessibilityRole="alert" style={{ gap: 6 }}>
      <Text v="h3" accessibilityRole="header">
        {title}
      </Text>
      <Text v="b2" color="t2">
        {body}
      </Text>
    </View>
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
      <Button label={cancel} variant="secondary" onPress={onClose} style={{ flex: 1 }} />
      <Button
        label={confirm}
        variant={danger ? 'danger' : 'primary'}
        onPress={() => {
          onClose()
          onConfirm()
        }}
        style={{ flex: 1 }}
      />
    </View>
  </BottomSheet>
)

export default ConfirmSheet
