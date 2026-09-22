import { Suspense } from 'react'
import type { ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { HomePage } from '@/pages/home'
import { SkeletonRows } from '@/shared/components'
import AppShell from './ui/app-shell'
import {
  ApplicationsPage,
  AuthCallbackPage,
  CalendarPage,
  ChatPage,
  DocEditorPage,
  DocumentsPage,
  GoogleCallbackPage,
  InterviewPage,
  JobDetailPage,
  PlanPage,
  SettingsPage,
  VaultPage,
} from './lazy-pages'

const suspense = (element: ReactNode) => <Suspense fallback={<SkeletonRows />}>{element}</Suspense>

export const ROUTE_CONFIG: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: suspense(<AuthCallbackPage />) },
  {
    path: '/integrations/google/callback',
    element: suspense(<GoogleCallbackPage />),
  },
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/chat/:id', element: suspense(<ChatPage />) },
      { path: '/documents', element: suspense(<DocumentsPage />) },
      { path: '/documents/:id', element: suspense(<DocEditorPage />) },
      { path: '/applications', element: suspense(<ApplicationsPage />) },
      { path: '/jobs/:id', element: suspense(<JobDetailPage />) },
      { path: '/vault', element: suspense(<VaultPage />) },
      { path: '/interview', element: suspense(<InterviewPage />) },
      { path: '/calendar', element: suspense(<CalendarPage />) },
      { path: '/settings', element: suspense(<SettingsPage />) },
      { path: '/settings/plan', element: suspense(<PlanPage />) },
    ],
  },
]
