import type { ApplicantSummary } from '@push/api-client'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ApplicantRow from './applicant-row'
import { APPLICANT_NEW } from './constants'

const applicant = (isNew: boolean): ApplicantSummary => ({
  applicationId: 'app-3',
  applicant: { displayName: '정민재', headline: null, jobCategory: 'dev', tenureYears: 5 },
  stage: 'APPLIED',
  appliedAt: '2026-10-19T01:00:00.000Z',
  isNew,
})

const html = (isNew: boolean) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ApplicantRow
        postingId="job-1"
        applicant={applicant(isNew)}
        busy={false}
        onMove={() => undefined}
      />
    </MemoryRouter>,
  )

describe('applicant row', () => {
  it('marks an applicant nobody has opened yet', () => {
    expect(html(true)).toContain(`>${APPLICANT_NEW}<`)
    expect(html(false)).not.toContain(`>${APPLICANT_NEW}<`)
  })
})
