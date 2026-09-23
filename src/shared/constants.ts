export const API_BASE_URL = 'http://localhost:8080/api/v1'

export const ROUTES = {
  login: '/login',
  home: '/',
  chat: (id: string) => `/chat/${id}`,
  documents: '/documents',
  document: (id: string) => `/documents/${id}`,
  applications: '/applications',
  job: (id: string) => `/jobs/${id}`,
  vault: '/vault',
  interview: '/interview',
  calendar: '/calendar',
  settings: '/settings',
  plan: '/settings/plan',
} as const

export const PROJECT_TAG_LABEL = '프로젝트'

export const COMPOSER_PLACEHOLDER = '메시지 입력'

export const EXPERIMENT_EVENTS = {
  exposure: 'exposure',
  conversion: 'conversion',
  aborted: 'aborted',
  reject: 'reject',
} as const

export const EXPERIMENT_KEYS = {
  streamRender: 'stream-render',
  approvalSurface: 'approval-surface',
} as const
