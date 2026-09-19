import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { ListEnvelope, ListParams } from '@/shared/api'
import type { Operation } from '@/features/chat'
import type { CalendarEvent } from './schemas'

export const listCalendarEvents = async (
  params: ListParams & { from: string; to: string; applicationId?: string },
): Promise<ListEnvelope<CalendarEvent>> =>
  request(() =>
    api.get('calendar/events', {
      searchParams: {
        from: params.from,
        to: params.to,
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const syncGoogle = async (): Promise<Operation> => {
  const env = await request<{ data: Operation }>(() =>
    api.post('integrations/google/sync', { json: {} }),
  )
  return env.data
}
