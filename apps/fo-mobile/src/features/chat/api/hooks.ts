import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import { api } from '../../../shared/infrastructure'
import { chatApi } from './client'
import { forget, send } from '../store'

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

export const useConversationList = () =>
  useQuery({ queryKey: ['conversations', 'all'], queryFn: () => chatApi.conversations({ limit: 100 }) })

export const useRenameConversation = (id: string, revision: number | undefined) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => {
      if (revision === undefined) throw new Error('missing conversation')
      return api.conversations.rename(id, revision, title)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
    onError: () => Alert.alert('이름을 바꾸지 못했어요', '잠시 뒤에 다시 해 주세요.'),
  })
}

export const useArchiveConversation = (id: string, revision: number | undefined) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => {
      if (revision === undefined) throw new Error('missing conversation')
      return api.conversations.archive(id, revision)
    },
    onSuccess: () => {
      forget(id)
      void qc.invalidateQueries({ queryKey: ['conversations'] })
      router.dismissTo('/chat')
    },
    onError: () => Alert.alert('대화를 지우지 못했어요', '잠시 뒤에 다시 해 주세요.'),
  })
}
