import { ApiError } from './errors'
import type { Contact, ContactMissing } from './types'

/** What a contact still lacks before an apply, in the order the server lists it. */
export const contactMissing = (contact: Contact | undefined): ContactMissing[] =>
  contact ? [...(contact.phone ? [] : ['PHONE' as const]), ...(contact.email ? [] : ['EMAIL' as const])] : []

/** The missing parts named by a 403 CONTACT_REQUIRED from apply, else null. */
export const contactRequired = (error: unknown): ContactMissing[] | null => {
  if (!(error instanceof ApiError) || error.code !== 'CONTACT_REQUIRED') return null
  const missing = error.details?.missing
  return Array.isArray(missing) ? missing.filter((m): m is ContactMissing => m === 'PHONE' || m === 'EMAIL') : ['PHONE', 'EMAIL']
}
