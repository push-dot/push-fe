import { describe, expect, it } from 'vitest'
import { employerGate, isPublicPath, needsLogin } from './access'
import { EMPLOYER_STAGE_ACTIONS, stageChangeBlocked } from './applicant-stage'
import {
  canInterviewPrep,
  canInvite,
  canUploadExternalPdf,
  canUseEmployerAi,
  seatLimit,
} from './employer-plan'
import { showFitCard } from './fit-card'
import { sanitizeReturnTo } from './return-to'

const employer = (verified: boolean) => ({ accountType: 'EMPLOYER' as const, verified })
const personal = { accountType: 'PERSONAL' as const, verified: false }

describe('showFitCard', () => {
  it('shows the fit card only inside the webview', () => {
    expect(showFitCard(false)).toBe(false)
    expect(showFitCard(true)).toBe(true)
  })
})

describe('sanitizeReturnTo', () => {
  it('keeps a same-origin path and its query', () => {
    expect(sanitizeReturnTo('/search')).toBe('/search')
    expect(sanitizeReturnTo('/postings/p1?x=1')).toBe('/postings/p1?x=1')
    expect(sanitizeReturnTo('/')).toBe('/')
  })

  it('rejects scheme, protocol-relative, backslash, and non-path values', () => {
    expect(sanitizeReturnTo('https://evil')).toBe('/')
    expect(sanitizeReturnTo('//evil')).toBe('/')
    expect(sanitizeReturnTo('/\\evil')).toBe('/')
    expect(sanitizeReturnTo('/\\\\evil')).toBe('/')
    expect(sanitizeReturnTo('')).toBe('/')
    expect(sanitizeReturnTo(null)).toBe('/')
    expect(sanitizeReturnTo(undefined)).toBe('/')
    expect(sanitizeReturnTo('postings/1')).toBe('/')
  })
})

describe('isPublicPath', () => {
  it('allows guest home, jobs, search, auth, and one posting segment', () => {
    for (const path of [
      '/',
      '/jobs',
      '/search',
      '/login',
      '/signup',
      '/auth/callback',
      '/auth/verify',
      '/auth/reset',
      '/postings/p1',
    ]) {
      expect(isPublicPath(path)).toBe(true)
    }
  })

  it('hides profiles, the posting index, and nested posting routes', () => {
    expect(isPublicPath('/profiles/u')).toBe(false)
    expect(isPublicPath('/postings')).toBe(false)
    expect(isPublicPath('/postings/p1/edit')).toBe(false)
  })
})

describe('needsLogin', () => {
  it('requires login only for a guest on a private path', () => {
    expect(needsLogin('/hub', false)).toBe(true)
    expect(needsLogin('/profiles/u', false)).toBe(true)
    expect(needsLogin('/postings', false)).toBe(true)
    expect(needsLogin('/postings/p1/edit', false)).toBe(true)
    expect(needsLogin('/search', false)).toBe(false)
    expect(needsLogin('/postings/p1', false)).toBe(false)
    expect(needsLogin('/hub', true)).toBe(false)
  })
})

describe('employerGate', () => {
  it('sends an unverified employer to verify on postings and chat', () => {
    expect(employerGate('/employer/chat', employer(false))).toBe('verify')
    expect(employerGate('/employer/chat/c1', employer(false))).toBe('verify')
    expect(employerGate('/employer/postings', employer(false))).toBe('verify')
    expect(employerGate('/employer/postings/new', employer(false))).toBe('verify')
    expect(employerGate('/employer/postings/p1/applicants', employer(false))).toBe('verify')
  })

  it('asks guests and personal accounts to log in before verified employer routes', () => {
    expect(employerGate('/employer/chat', null)).toBe('login')
    expect(employerGate('/employer/postings', personal)).toBe('login')
    expect(employerGate('/employer/chat/c1', personal)).toBe('login')
  })

  it('lets a verified employer through postings and chat', () => {
    expect(employerGate('/employer/chat', employer(true))).toBe('ok')
    expect(employerGate('/employer/postings/p1/edit', employer(true))).toBe('ok')
  })

  it('requires an employer login but not verification for verify, members, plans, and invites', () => {
    for (const path of [
      '/employer/verify',
      '/employer/members',
      '/employer/plans',
      '/invites/tok',
    ]) {
      expect(employerGate(path, null)).toBe('login')
      expect(employerGate(path, personal)).toBe('login')
      expect(employerGate(path, employer(false))).toBe('ok')
      expect(employerGate(path, employer(true))).toBe('ok')
    }
  })

  it('leaves other paths open', () => {
    expect(employerGate('/jobs', null)).toBe('ok')
    expect(employerGate('/hub', personal)).toBe('ok')
    expect(employerGate('/employer', employer(false))).toBe('ok')
    expect(employerGate('/invites', null)).toBe('ok')
  })
})

describe('employer plan gates', () => {
  it('allows interview prep on Pro and Ultra only', () => {
    expect(canInterviewPrep('PRO')).toBe(true)
    expect(canInterviewPrep('ULTRA')).toBe(true)
    expect(canInterviewPrep('BASIC')).toBe(false)
    expect(canInterviewPrep(null)).toBe(false)
  })

  it('allows an external pdf on Ultra only', () => {
    expect(canUploadExternalPdf('ULTRA')).toBe(true)
    expect(canUploadExternalPdf('PRO')).toBe(false)
    expect(canUploadExternalPdf('BASIC')).toBe(false)
    expect(canUploadExternalPdf(null)).toBe(false)
  })

  it('allows employer AI only after verification', () => {
    expect(canUseEmployerAi(true)).toBe(true)
    expect(canUseEmployerAi(false)).toBe(false)
  })

  it('caps seats at 5, 2, and 0 and blocks an invite at the cap', () => {
    expect(seatLimit('ULTRA')).toBe(5)
    expect(seatLimit('PRO')).toBe(2)
    expect(seatLimit('BASIC')).toBe(0)
    expect(seatLimit(null)).toBe(0)
    expect(canInvite('PRO', 2)).toBe(false)
    expect(canInvite('PRO', 1)).toBe(true)
    expect(canInvite('ULTRA', 5)).toBe(false)
    expect(canInvite('ULTRA', 4)).toBe(true)
    expect(canInvite('BASIC', 0)).toBe(false)
    expect(canInvite(null, 0)).toBe(false)
  })
})

describe('applicant stage actions', () => {
  it('maps the four employer labels to stages', () => {
    expect(EMPLOYER_STAGE_ACTIONS).toEqual([
      { label: '서류 통과', stage: 'SCREENING' },
      { label: '면접', stage: 'INTERVIEW' },
      { label: '합격', stage: 'OFFER' },
      { label: '불합격', stage: 'REJECTED' },
    ])
  })

  it('blocks only rejected, accepted, and withdrawn', () => {
    expect(stageChangeBlocked('REJECTED')).toBe(true)
    expect(stageChangeBlocked('ACCEPTED')).toBe(true)
    expect(stageChangeBlocked('WITHDRAWN')).toBe(true)
    expect(stageChangeBlocked('OFFER')).toBe(false)
    expect(stageChangeBlocked('SCREENING')).toBe(false)
    expect(stageChangeBlocked('INTERVIEW')).toBe(false)
    expect(stageChangeBlocked('APPLIED')).toBe(false)
    expect(stageChangeBlocked('DISCOVERED')).toBe(false)
    expect(stageChangeBlocked('PREPARING')).toBe(false)
    expect(stageChangeBlocked('READY')).toBe(false)
  })
})
