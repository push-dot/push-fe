import { describe, expect, it } from 'vitest'
import { EMPLOYER_MENU, PERSONAL_MENU } from './constants'

describe('my menu', () => {
  it('puts 내 링크 on personal 마이 and keeps it off the employer menu', () => {
    expect(PERSONAL_MENU.map((item) => item.label)).toContain('내 링크')
    expect(EMPLOYER_MENU.map((item) => item.label)).not.toContain('내 링크')
    expect(EMPLOYER_MENU.map((item) => item.label)).not.toContain('서류')
  })
})
