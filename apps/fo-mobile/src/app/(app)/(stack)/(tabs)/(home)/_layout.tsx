import { Stack } from 'expo-router'
import { useFocusedOnce } from '@/shared/navigation'

const TabStack = () => (useFocusedOnce() ? <Stack screenOptions={{ headerShown: false }} /> : null)

export default TabStack
