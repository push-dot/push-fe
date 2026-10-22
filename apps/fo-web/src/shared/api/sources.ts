import type { Source, UploadedSource } from '@push/api-client'
import { isMock } from '../lib/bridge'
import { apiBaseUrl } from './client'
import { mockFetch } from './mock'

const sessionSources: UploadedSource[] = []

export const rememberSource = (source: UploadedSource) => {
  sessionSources.unshift(source)
}

export const listSources = async (): Promise<UploadedSource[]> => {
  if (!isMock()) return [...sessionSources]
  const response = await mockFetch(`${apiBaseUrl.replace(/\/+$/, '')}/sources`)
  if (!response.ok) return []
  const body = (await response.json()) as { data?: Source[] }
  return body.data ?? []
}
