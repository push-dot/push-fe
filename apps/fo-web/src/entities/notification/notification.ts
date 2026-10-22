import { useQuery } from '@tanstack/react-query'
import { meWebNotifications as fetchNotifications } from '../../shared/api/operations'

export const meWebNotifications = (...args: Parameters<typeof fetchNotifications>) => fetchNotifications(...args)

export const useNotifications = (enabled = true) =>
  useQuery({ queryKey: ['notifications'], queryFn: () => meWebNotifications(), enabled })
