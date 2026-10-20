import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { isWebView } from '../bridge'
import CallbackPage from '../pages/login/callback-page'
import LoginPage from '../pages/login/login-page'
import ResetPage from '../pages/login/reset-page'
import SignupPage from '../pages/login/signup-page'
import VerifyPage from '../pages/login/verify-page'
import HomePage from '../pages/home/home-page'
import JobsPage from '../pages/jobs/jobs-page'
import { PostingPage } from '../pages/PostingPage'
import { ProfilePage } from '../pages/ProfilePage'
import SearchPage from '../pages/search/search-page'
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
          <Route path="/auth/verify" element={<VerifyPage />} />
          <Route path="/auth/reset" element={<ResetPage />} />
          <Route path="/postings/:id" element={<PostingPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/profiles/:id" element={<ProfilePage />} />
            <Route path="/hub" element={<SoonPage title={SOON_TITLE.hub} />} />
            <Route path="/social" element={<SoonPage title={SOON_TITLE.social} />} />
            <Route path="/posts/:id" element={<SoonPage title={SOON_TITLE.social} />} />
            <Route path="/me" element={<SoonPage title={SOON_TITLE.my} />} />
            <Route path="/offers" element={<SoonPage title={SOON_TITLE.offers} />} />
            <Route path="/offers/:id" element={<SoonPage title={SOON_TITLE.offers} />} />
            <Route path="/notifications" element={<SoonPage title={SOON_TITLE.notifications} />} />
            <Route path="/settings" element={<SoonPage title={SOON_TITLE.settings} />} />
            <Route path="/employer/verify" element={<SoonPage title={SOON_TITLE.verify} />} />
            <Route path="/employer/postings" element={<SoonPage title={SOON_TITLE.postings} />} />
            <Route path="/employer/postings/new" element={<SoonPage title={SOON_TITLE.postings} />} />
            <Route path="/employer/postings/:id/edit" element={<SoonPage title={SOON_TITLE.postings} />} />
            <Route path="/employer/postings/:id/applicants" element={<SoonPage title={SOON_TITLE.postings} />} />
            <Route
              path="/employer/postings/:id/applicants/:applicationId"
              element={<SoonPage title={SOON_TITLE.postings} />}
            />
            <Route path="/employer/chat" element={<SoonPage title={SOON_TITLE.chat} />} />
            <Route path="/employer/chat/new" element={<SoonPage title={SOON_TITLE.chat} />} />
            <Route path="/employer/chat/:id" element={<SoonPage title={SOON_TITLE.chat} />} />
            <Route path="/employer/members" element={<SoonPage title={SOON_TITLE.members} />} />
            <Route path="/employer/plans" element={<SoonPage title={SOON_TITLE.plans} />} />
            <Route path="/invites/:token" element={<SoonPage title={SOON_TITLE.invite} />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
