import { describe, expect, it } from 'vitest'
import { emailTakenCopy, loginProviders, passwordError } from './login-providers'

describe('loginProviders', () => {
  it('offers google, github, and email for a personal account', () => {
    expect(loginProviders('PERSONAL')).toEqual(['google', 'github', 'email'])
  })

  it('offers google and email for an employer account', () => {
    expect(loginProviders('EMPLOYER')).toEqual(['google', 'email'])
  })
})

describe('emailTakenCopy', () => {
  it('names the employer account when that type already owns the email', () => {
    expect(emailTakenCopy('EMPLOYER')).toBe('이 이메일은 기업 계정으로 가입되어 있어요')
  })

  it('names the personal account for every other type', () => {
    expect(emailTakenCopy('PERSONAL')).toBe('이 이메일은 개인 계정으로 가입되어 있어요')
    expect(emailTakenCopy(null)).toBe('이 이메일은 개인 계정으로 가입되어 있어요')
    expect(emailTakenCopy(undefined)).toBe('이 이메일은 개인 계정으로 가입되어 있어요')
  })
})

describe('passwordError', () => {
  it('rejects passwords shorter than 8 or longer than 128', () => {
    expect(passwordError('short')).toBe('비밀번호는 8자 이상이어야 해요')
    expect(passwordError('1234567')).toBe('비밀번호는 8자 이상이어야 해요')
    expect(passwordError('a'.repeat(129))).toBe('비밀번호는 8자 이상이어야 해요')
  })

  it('accepts passwords from 8 through 128 characters', () => {
    expect(passwordError('12345678')).toBeNull()
    expect(passwordError('a'.repeat(128))).toBeNull()
  })
})
