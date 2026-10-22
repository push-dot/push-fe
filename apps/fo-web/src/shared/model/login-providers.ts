import type { AccountType } from './access'
import {
  EMAIL_TAKEN_EMPLOYER_COPY,
  EMAIL_TAKEN_PERSONAL_COPY,
  PASSWORD_LENGTH_COPY,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from './constants'

export type LoginProvider = 'google' | 'github' | 'email'

const PERSONAL_PROVIDERS: LoginProvider[] = ['google', 'github', 'email']
const EMPLOYER_PROVIDERS: LoginProvider[] = ['google', 'email']

export const loginProviders = (accountType: AccountType): LoginProvider[] =>
  accountType === 'EMPLOYER' ? [...EMPLOYER_PROVIDERS] : [...PERSONAL_PROVIDERS]

export const emailTakenCopy = (accountType: unknown) =>
  accountType === 'EMPLOYER' ? EMAIL_TAKEN_EMPLOYER_COPY : EMAIL_TAKEN_PERSONAL_COPY

export const passwordError = (password: string) => {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return PASSWORD_LENGTH_COPY
  return null
}
