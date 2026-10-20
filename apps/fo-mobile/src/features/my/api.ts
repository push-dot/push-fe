import * as Crypto from 'expo-crypto'
import {
  createClient,
  type DataEnvelope,
  type ListEnvelope,
  type Profile,
  type Source,
} from '@push/api-client'
import { API_BASE_URL, API_MOCK } from '../../lib/config'
import { useSession } from '../../lib/session'
import { mockFetch } from '../../mock'

export type CalendarEventType = 'INTERVIEW' | 'DEADLINE' | 'FOLLOW_UP' | 'COFFEE_CHAT' | 'CUSTOM'
export type CalendarEvent = {
  id: string
  type: CalendarEventType
  title: string
  startsAt: string
  endsAt: string | null
  location: string | null
  note: string | null
}

/** What the server read out of an uploaded 서류 (DocViewer preview + 내 프로필로 전환). */
export type ResumeDraft = {
  pageCount: number
  email: string | null
  links: string[]
  profile: Pick<
    Profile,
    'displayName' | 'headline' | 'jobCategory' | 'tenureYears' | 'intro' | 'careers' | 'skills'
  >
}

// shortcut: endpoints @push/api-client lacks (sources list, calendar, resume→profile draft) go through this
// second client without token refresh; move them into @push/api-client once push-be ships them.
const c = createClient({
  baseUrl: API_BASE_URL,
  getToken: () => useSession.getState().session?.accessToken,
  fetch: API_MOCK ? mockFetch : undefined,
  uuid: () => Crypto.randomUUID(),
})

export const myApi = {
  sources: () => c.get<ListEnvelope<Source>>('sources'),
  resumeDraft: async (sourceId: string) =>
    (await c.get<DataEnvelope<ResumeDraft>>(`sources/${sourceId}/profile-draft`)).data,
  calendar: (from: string, to: string) =>
    c.get<{ data: CalendarEvent[]; google: { connected: boolean } }>('calendar/events', {
      query: { from, to },
    }),
  addEvent: async (body: Pick<CalendarEvent, 'type' | 'title' | 'startsAt'>) =>
    (await c.post<DataEnvelope<CalendarEvent>>('calendar/events', { body })).data,
}
