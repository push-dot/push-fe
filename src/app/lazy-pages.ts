import { lazy } from 'react'

export const AuthCallbackPage = lazy(() => import('@/pages/auth-callback-page'))
export const GoogleCallbackPage = lazy(() => import('@/pages/google-callback-page'))
export const ChatPage = lazy(() => import('@/pages/chat-page'))
export const DocumentsPage = lazy(() => import('@/pages/documents-page'))
export const DocEditorPage = lazy(() => import('@/pages/doc-editor-page'))
export const ApplicationsPage = lazy(() => import('@/pages/applications-page'))
export const JobDetailPage = lazy(() => import('@/pages/job-detail-page'))
export const VaultPage = lazy(() => import('@/pages/vault-page'))
export const InterviewPage = lazy(() => import('@/pages/interview-page'))
export const CalendarPage = lazy(() => import('@/pages/calendar-page'))
export const SettingsPage = lazy(() => import('@/pages/settings-page'))
export const PlanPage = lazy(() => import('@/pages/plan-page'))
