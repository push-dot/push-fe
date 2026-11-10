import { useState } from 'react'
import {
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import { isWebView } from '../shared/lib/bridge'
import CallbackPage from '../pages/login/callback-page'
import LoginPage from '../pages/login/login-page'
import ResetPage from '../pages/login/reset-page'
import SignupPage from '../pages/login/signup-page'
import EmailVerifyPage from '../pages/login/verify-page'
import HomePage from '../pages/home/home-page'
import HubPage from '../pages/hub/hub-page'
import JobsPage from '../pages/jobs/jobs-page'
import MyPage from '../pages/my/my-page'
import NotificationsPage from '../pages/notifications/notifications-page'
import OfferDetailPage from '../pages/offers/offer-detail-page'
import OffersPage from '../pages/offers/offers-page'
import PostingPage from '../pages/posting/posting-page'
import ProfilePage from '../pages/profile/profile-page'
import SearchPage from '../pages/search/search-page'
import BlockedPage from '../pages/settings/blocked-page'
import SettingsPage from '../pages/settings/settings-page'
import PostPage from '../pages/social/post-page'
import SocialPage from '../pages/social/social-page'
import ApplicantPage from '../pages/employer/applicant-page'
import ApplicantsPage from '../pages/employer/applicants-page'
import ChatNewPage from '../pages/employer/chat-new-page'
import ChatPage from '../pages/employer/chat-page'
import ChatThreadPage from '../pages/employer/chat-thread-page'
import InvitePage from '../pages/employer/invite-page'
import MembersPage from '../pages/employer/members-page'
import PostingEditorPage from '../pages/employer/posting-editor-page'
import PlansPage from '../pages/employer/plans-page'
import PostingsPage from '../pages/employer/postings-page'
import EmployerVerifyPage from '../pages/employer/verify-page'
import LegalPage from '../pages/legal/legal-page'
import NotFoundPage from '../pages/not-found/not-found-page'
import RequireAuth from './require-auth'
import { RouteError, WebViewNotFound } from './route-error'
import Shell from './shell'

// A new page opens at the top; back and forward restore where the reader was.
export const ScrollRoot = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
)

export const appRoutes = (webView: boolean) =>
  createRoutesFromElements(
    webView ? (
      <Route element={<ScrollRoot />} errorElement={<RouteError />}>
        <Route path="/postings/:id" element={<PostingPage />} />
        <Route path="/profiles/:id" element={<ProfilePage />} />
        <Route path="*" element={<WebViewNotFound />} />
      </Route>
    ) : (
      <Route element={<ScrollRoot />} errorElement={<RouteError />}>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />
          <Route path="/auth/verify" element={<EmailVerifyPage />} />
          <Route path="/auth/reset" element={<ResetPage />} />
          <Route path="/invites/:token" element={<InvitePage />} />
          <Route path="/postings/:id" element={<PostingPage />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/privacy-consent" element={<LegalPage kind="privacyConsent" />} />
          <Route path="/marketing-consent" element={<LegalPage kind="marketingConsent" />} />
          <Route element={<RequireAuth />}>
            <Route path="/profiles/:id" element={<ProfilePage />} />
            <Route path="/hub" element={<HubPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/posts/:id" element={<PostPage />} />
            <Route path="/me" element={<MyPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/:id" element={<OfferDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/blocked" element={<BlockedPage />} />
            <Route path="/employer/verify" element={<EmployerVerifyPage />} />
            <Route path="/employer/postings" element={<PostingsPage />} />
            <Route path="/employer/postings/new" element={<PostingEditorPage />} />
            <Route path="/employer/postings/:id/edit" element={<PostingEditorPage />} />
            <Route path="/employer/postings/:id/applicants" element={<ApplicantsPage />} />
            <Route
              path="/employer/postings/:id/applicants/:applicationId"
              element={<ApplicantPage />}
            />
            <Route path="/employer/chat" element={<ChatPage />} />
            <Route path="/employer/chat/new" element={<ChatNewPage />} />
            <Route path="/employer/chat/:id" element={<ChatThreadPage />} />
            <Route path="/employer/members" element={<MembersPage />} />
            <Route path="/employer/plans" element={<PlansPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    ),
  )

const AppRouter = () => {
  const [router] = useState(() => createBrowserRouter(appRoutes(isWebView())))
  return <RouterProvider router={router} />
}

export default AppRouter
