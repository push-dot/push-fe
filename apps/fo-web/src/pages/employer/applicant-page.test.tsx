import type { ApplicantDetail } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ApplicantPage from './applicant-page'
import { PROFILE_NOW, submittedAsIs } from './constants'

const detail = (source: 'CURRENT' | 'SUBMITTED'): ApplicantDetail => ({
  application: {
    id: 'app-2',
    revision: 1,
    jobId: 'job-1',
    company: '모아페이',
    title: '결제 승인 백엔드 엔지니어',
    stage: 'SCREENING',
    appliedAt: '2026-10-20T01:00:00.000Z',
    createdAt: '2026-10-20T01:00:00.000Z',
  },
  documents: [{ id: 'd1', title: '이력서', content: '소개' }],
  applicant: {
    displayName: '김태윤',
    email: 'taeyoon.kim@gmail.com',
    headline: '백엔드 엔지니어',
    careers: [],
    skills: [],
    hubProfileId: null,
    profileSource: source,
    capturedAt: source === 'SUBMITTED' ? '2026-10-20T01:00:00.000Z' : null,
  },
})

const html = (source: 'CURRENT' | 'SUBMITTED') => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(['employer-applicant', 'job-1', 'app-2'], detail(source))
  client.setQueryData(['employer-applicants', 'job-1', null], { data: [] })
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/employer/postings/job-1/applicants/app-2']}>
        <Routes>
          <Route
            path="/employer/postings/:id/applicants/:applicationId"
            element={<ApplicantPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('applicant detail profile line', () => {
  it('says the profile is current when there is no snapshot, and keeps the submitted line otherwise', () => {
    expect(html('CURRENT')).toContain(PROFILE_NOW)
    expect(html('CURRENT')).not.toContain('제출한 그대로')
    expect(html('SUBMITTED')).toContain(submittedAsIs('10월 20일'))
    expect(html('SUBMITTED')).not.toContain(PROFILE_NOW)
  })
})
