import { lazy } from 'react'

export const AuthCallbackPage = lazy(() =>
  import('@/pages/auth-callback').then((m) => ({ default: m.AuthCallbackPage })),
)
export const GoogleCallbackPage = lazy(() =>
  import('@/pages/google-callback').then((m) => ({ default: m.GoogleCallbackPage })),
)
export const ChatPage = lazy(() => import('@/pages/chat').then((m) => ({ default: m.ChatPage })))
export const DocumentsPage = lazy(() =>
  import('@/pages/documents').then((m) => ({ default: m.DocumentsPage })),
)
export const DocEditorPage = lazy(() =>
  import('@/pages/doc-editor').then((m) => ({ default: m.DocEditorPage })),
)
export const ApplicationsPage = lazy(() =>
  import('@/pages/applications').then((m) => ({ default: m.ApplicationsPage })),
)
export const JobDetailPage = lazy(() =>
  import('@/pages/job-detail').then((m) => ({ default: m.JobDetailPage })),
)
export const VaultPage = lazy(() => import('@/pages/vault').then((m) => ({ default: m.VaultPage })))
export const InterviewPage = lazy(() =>
  import('@/pages/interview').then((m) => ({ default: m.InterviewPage })),
)
export const CalendarPage = lazy(() =>
  import('@/pages/calendar').then((m) => ({ default: m.CalendarPage })),
)
export const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
)
export const PlanPage = lazy(() => import('@/pages/plan').then((m) => ({ default: m.PlanPage })))
