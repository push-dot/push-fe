import { router } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { Button, Sheet, Text, showToast, useConfirmStore } from '@/shared/components'
import { spacing } from '@/theme'

const ConfirmSheetScreen = () => {
  const request = useConfirmStore((s) => s.request)

  useEffect(() => {
    if (!request) router.back()
  }, [request])

  useEffect(() => () => useConfirmStore.getState().set(null), [])

  // PROBE ONLY (probe/r4-shared): a toast shown while the sheet is open, for ToastSheetAndroid panel 3.
  useEffect(() => {
    const t = setTimeout(() => showToast({ message: '삭제하지 못했어요. 다시 시도해 주세요' }), 15000)
    return () => clearTimeout(t)
  }, [])

  if (!request) return null

  return (
    <Sheet gap={spacing[2]}>
      <View accessibilityRole="alert" style={{ gap: spacing[2] }}>
        <Text v="h3" accessibilityRole="header" style={{ paddingTop: spacing[1] }}>
          {request.title}
        </Text>
        <Text v="b2" color="t2">
          {request.body}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] }}>
        <Button label={request.cancel ?? '취소'} variant="secondary" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button
          label={request.confirm}
          variant={request.danger ? 'danger' : 'primary'}
          onPress={() => {
            router.back()
            request.onConfirm()
          }}
          style={{ flex: 1 }}
        />
      </View>
    </Sheet>
  )
}

export default ConfirmSheetScreen
