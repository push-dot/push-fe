import { describe, expect, it } from 'vitest'
import { mockFetch, setMockPersona } from './mock'

describe('employer applicant stage mock', () => {
  it('moves an open application to screening and refuses a change after rejection', async () => {
    setMockPersona('employer')
    const moved = await mockFetch('http://localhost/api/v1/postings/job-1/applicants/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'SCREENING' }),
    })
    expect(moved.status).toBe(200)
    expect(((await moved.json()) as { data: { stage: string } }).data.stage).toBe('SCREENING')

    const rejected = await mockFetch('http://localhost/api/v1/postings/job-1/applicants/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'REJECTED' }),
    })
    expect(rejected.status).toBe(200)

    const blocked = await mockFetch('http://localhost/api/v1/postings/job-1/applicants/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'INTERVIEW' }),
    })
    expect(blocked.status).toBe(409)
    expect(((await blocked.json()) as { error: { code: string } }).error.code).toBe('INVALID_TRANSITION')
  })
})
