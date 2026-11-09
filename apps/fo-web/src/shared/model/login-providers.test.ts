import { describe, expect, it } from 'vitest'
import { emailSignupInput, emailTakenCopy, loginProviders, passwordError } from './login-providers'

describe('loginProviders', () => {
  it('offers google, apple, github, and phone for a personal account, never email', () => {
    expect(loginProviders('PERSONAL')).toEqual(['google', 'apple', 'github', 'phone'])
  })

  it('offers google and email for an employer account', () => {
    expect(loginProviders('EMPLOYER')).toEqual(['google', 'email'])
  })
})

describe('emailTakenCopy', () => {
  it('names the employer account when that type already owns the email', () => {
    expect(emailTakenCopy('EMPLOYER')).toBe('이 이메일은 기업 계정으로 가입되어 있어요. 기업 계정은 다른 이메일로 만들어 주세요.')
  })

  it('names the personal account for every other type', () => {
    expect(emailTakenCopy('PERSONAL')).toBe('이 이메일은 개인 계정으로 가입되어 있어요')
    expect(emailTakenCopy(null)).toBe('이 이메일은 개인 계정으로 가입되어 있어요')
    expect(emailTakenCopy(undefined)).toBe('이 이메일은 개인 계정으로 가입되어 있어요')
  })
})

describe('passwordError', () => {
  it('rejects passwords shorter than 8 or longer than 128', () => {
    expect(passwordError('short')).toBe('비밀번호가 너무 짧아요. 8자 이상, 영문과 숫자를 섞어 주세요.')
    expect(passwordError('1234567')).toBe('비밀번호가 너무 짧아요. 8자 이상, 영문과 숫자를 섞어 주세요.')
    expect(passwordError('a'.repeat(129))).toBe('비밀번호가 너무 짧아요. 8자 이상, 영문과 숫자를 섞어 주세요.')
  })

  it('accepts passwords from 8 through 128 characters', () => {
    expect(passwordError('12345678')).toBeNull()
    expect(passwordError('a'.repeat(128))).toBeNull()
  })
})

describe('emailSignupInput', () => {
  const form = { email: 'hr@acme.kr', password: 'password1', accountType: 'EMPLOYER' as const, displayName: '김서준' }

  it('sends agreeTerms true once the terms checkbox is ticked', () => {
    expect(emailSignupInput({ ...form, terms: true })).toEqual({ ...form, agreeTerms: true })
  })

  it('sends nothing while the terms checkbox is off', () => {
    expect(emailSignupInput({ ...form, terms: false })).toBeNull()
  })
})
