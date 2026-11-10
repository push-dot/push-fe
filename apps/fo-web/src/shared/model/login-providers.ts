import type { EmailSignupInput } from '@push/api-client'

import type { AccountType } from './access'
import {
  EMAIL_TAKEN_EMPLOYER_COPY,
  EMAIL_TAKEN_PERSONAL_COPY,
  PASSWORD_LENGTH_COPY,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from './constants'

export type OAuthProvider = 'google' | 'apple' | 'github'
export type LoginProvider = OAuthProvider | 'phone' | 'email'

const PERSONAL_PROVIDERS: LoginProvider[] = ['google', 'apple', 'github', 'phone']
const EMPLOYER_PROVIDERS: LoginProvider[] = ['google', 'email']

export const loginProviders = (accountType: AccountType): LoginProvider[] =>
  accountType === 'EMPLOYER' ? [...EMPLOYER_PROVIDERS] : [...PERSONAL_PROVIDERS]

export const emailTakenCopy = (accountType: unknown) =>
  accountType === 'EMPLOYER' ? EMAIL_TAKEN_EMPLOYER_COPY : EMAIL_TAKEN_PERSONAL_COPY

export const passwordError = (password: string) => {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return PASSWORD_LENGTH_COPY
  return null
}

type SignupForm = Omit<EmailSignupInput, 'agreeTerms' | 'consentReference'> & { terms: boolean }

// push-be records the 약관·처리방침 agreement from agreeTerms, so it is sent only after the checkbox is ticked.
export const emailSignupInput = ({ terms, ...form }: SignupForm): EmailSignupInput | null =>
  terms ? { ...form, agreeTerms: true } : null
