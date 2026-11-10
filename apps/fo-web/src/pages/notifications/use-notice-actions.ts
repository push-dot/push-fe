import type { WebNotification } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { notificationPath } from '../../entities/notification'
import { meReadNotifications } from '../../features/read-notifications'

export const useNoticeActions = (afterOpen?: () => void) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const read = useMutation({
    mutationFn: (ids: string[] | 'all') => meReadNotifications(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
  const open = async (notice: WebNotification) => {
    await read.mutateAsync([notice.id])
    afterOpen?.()
    const path = notificationPath(notice)
    if (path) navigate(path)
  }
  return { read, open }
}
