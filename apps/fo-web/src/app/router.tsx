import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { isWebView } from '../bridge'
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
import { PostingPage } from '../pages/PostingPage'
import { ProfilePage } from '../pages/ProfilePage'
import SearchPage from '../pages/search/search-page'
import SettingsPage from '../pages/settings/settings-page'
import PostPage from '../pages/social/post-page'
import SocialPage from '../pages/social/social-page'
import ApplicantPage from '../pages/employer/applicant-page'
import ApplicantsPage from '../pages/employer/applicants-page'
import InvitePage from '../pages/employer/invite-page'
import MembersPage from '../pages/employer/members-page'
import PostingEditorPage from '../pages/employer/posting-editor-page'
import PostingsPage from '../pages/employer/postings-page'
import EmployerVerifyPage from '../pages/employer/verify-page'
import SoonPage from '../pages/soon-page'
import { SOON_TITLE } from './constants'
import RequireAuth from './require-auth'
import Shell from './shell'

const AppRouter = () => {
  if (isWebView()) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/postings/:id" element={<PostingPage />} />
          <Route path="/profiles/:id" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    )
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />
          <Route path="/auth/verify" element={<EmailVerifyPage />} />
          <Route path="/auth/reset" element={<ResetPage />} />
          <Route path="/postings/:id" element={<PostingPage />} />
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
            <Route path="/employer/verify" element={<EmployerVerifyPage />} />
            <Route path="/employer/postings" element={<PostingsPage />} />
            <Route path="/employer/postings/new" element={<PostingEditorPage />} />
            <Route path="/employer/postings/:id/edit" element={<PostingEditorPage />} />
            <Route path="/employer/postings/:id/applicants" element={<ApplicantsPage />} />
            <Route path="/employer/postings/:id/applicants/:applicationId" element={<ApplicantPage />} />
            <Route path="/employer/chat" element={<SoonPage title={SOON_TITLE.chat} />} />
            <Route path="/employer/chat/new" element={<SoonPage title={SOON_TITLE.chat} />} />
            <Route path="/employer/chat/:id" element={<SoonPage title={SOON_TITLE.chat} />} />
            <Route path="/employer/members" element={<MembersPage />} />
            <Route path="/employer/plans" element={<SoonPage title={SOON_TITLE.plans} />} />
            <Route path="/invites/:token" element={<InvitePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
