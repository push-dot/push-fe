import { describe, expect, it } from 'vitest'
import { ApiError } from '../errors'
import { contactMissing, contactRequired } from '../contact'

describe('contact', () => {
  it('lists what a contact lacks', () => {
    expect(contactMissing({ phone: null, email: null, loginEmail: 'a@b.co' })).toEqual(['PHONE', 'EMAIL'])
    expect(contactMissing({ phone: '+821012345678', email: null, loginEmail: null })).toEqual(['EMAIL'])
    expect(contactMissing({ phone: '+821012345678', email: 'a@b.co', loginEmail: null })).toEqual([])
    expect(contactMissing(undefined)).toEqual([])
  })

  it('reads CONTACT_REQUIRED only', () => {
    const required = new ApiError('x', 'CONTACT_REQUIRED', 403, { missing: ['EMAIL'] })
    expect(contactRequired(required)).toEqual(['EMAIL'])
    expect(contactRequired(new ApiError('x', 'FORBIDDEN', 403))).toBeNull()
    expect(contactRequired(new Error('x'))).toBeNull()
  })
})
