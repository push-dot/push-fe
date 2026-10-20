import type { Source } from '@push/api-client'
import { apiBaseUrl } from '../../api'
import { isMock } from '../../bridge'
import { mockFetch } from '../../mock'

const sessionSources: Source[] = []

export const rememberSource = (source: Source) => {
  sessionSources.unshift(source)
}

export const listSources = async (): Promise<Source[]> => {
  if (!isMock()) return [...sessionSources]
  const response = await mockFetch(`${apiBaseUrl.replace(/\/+$/, '')}/sources`)
  if (!response.ok) return []
  const body = (await response.json()) as { data?: Source[] }
  return body.data ?? []
}
