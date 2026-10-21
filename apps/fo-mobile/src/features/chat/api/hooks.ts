import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import { api } from '../../../shared/infrastructure'
import { send } from '../store'

export const useStartChat = () => {
  const qc = useQueryClient()
  return async (title: string, message: string, attachment?: string, replace?: boolean) => {
    try {
      const conv = await api.conversations.create(title.slice(0, 300))
      void qc.invalidateQueries({ queryKey: ['conversations'] })
      if (replace) router.replace(`/chat/${conv.id}`)
      else router.push(`/chat/${conv.id}`)
      send(conv.id, message, attachment)
    } catch {
      Alert.alert('대화를 시작하지 못했어요', '잠시 뒤에 다시 해 주세요.')
    }
  }
}
