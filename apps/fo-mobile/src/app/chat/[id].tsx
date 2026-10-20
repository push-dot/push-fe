import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

// Placeholder until the AI 채팅 conversation screen is implemented.
export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{id}</Text>
    </View>
  )
}
