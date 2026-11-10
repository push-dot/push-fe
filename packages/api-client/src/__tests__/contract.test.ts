import { describe, expect, expectTypeOf, it } from 'vitest'
import type { ApiError } from '../errors'
import type {
  ApiErrorReason,
  ApplicantDetail,
  ApplicantListItem,
  ArchivedDocument,
  InviteExpiredDetails,
  MessageAttachment,
  ReferencedByEvidenceDetails,
  StreamEvent,
  Tenure,
} from '../types'

describe('follow-up contract', () => {
  it('keeps the new fields on the types the web and app read', () => {
    expectTypeOf<ApplicantListItem['isNew']>().toEqualTypeOf<boolean>()
    expectTypeOf<NonNullable<ApplicantDetail['applicant']>['profileSource']>().toEqualTypeOf<'SUBMITTED' | 'CURRENT'>()
    expectTypeOf<NonNullable<ApplicantDetail['applicant']>['capturedAt']>().toEqualTypeOf<string | null>()
    expectTypeOf<ArchivedDocument['archivedAt']>().toBeString()
    expectTypeOf<ArchivedDocument['purgeAt']>().toBeString()
    expectTypeOf<MessageAttachment['documentTitles']>().toEqualTypeOf<string[] | undefined>()
    type Approval = Extract<StreamEvent, { type: 'approval' }>
    expectTypeOf<NonNullable<Approval['rows']>[number]>().toEqualTypeOf<{
      name: string
      initial?: string
      from: string
      to: string
    }>()
    expectTypeOf<Tenure>().toEqualTypeOf<'0' | '1-2' | '3-5' | '6-9' | '10+'>()

    const expired = {
      reason: 'EXPIRED',
      companyName: '푸시',
      inviterName: '',
      expiresAt: null,
    } satisfies InviteExpiredDetails
    const referenced = { reason: 'REFERENCED_BY_EVIDENCE', evidenceCount: 2 } satisfies ReferencedByEvidenceDetails
    const expiredReason: ApiErrorReason = expired.reason
    const referencedReason: ApiErrorReason = referenced.reason
    expect(expiredReason).toBe('EXPIRED')
    expect(referencedReason).toBe('REFERENCED_BY_EVIDENCE')
    expectTypeOf<ApiError['details']>().toEqualTypeOf<Record<string, unknown> | null | undefined>()
  })
})
