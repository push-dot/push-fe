import { Stack } from 'expo-router'
import { useFocusedOnce } from '@/shared/navigation'

// Unique initial route per tab group avoids duplicate "/" paths across groups.
export const unstable_settings = { initialRouteName: 'hub' }

const TabStack = () => (useFocusedOnce() ? <Stack screenOptions={{ headerShown: false }} /> : null)

export default TabStack
