import { useQuery } from '@tanstack/react-query'
import { api } from '../../../shared/infrastructure'

export const useUnreadOffers = () =>
  useQuery({
    queryKey: ['me', 'offers', 'received', 'unread'],
    queryFn: () => api.me.offers('received', { limit: 50 }),
    select: (r) => r.data.filter((o) => !o.readAt).length,
  })
