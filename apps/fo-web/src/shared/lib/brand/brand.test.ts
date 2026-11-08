import { describe, expect, it } from 'vitest'
import { brandGradient, companyColor, personColor } from './brand'

describe('brand colours', () => {
  it('uses the board colour for known companies, also inside a legal name', () => {
    expect(companyColor('모아페이')).toBe('#1F3A8A')
    expect(companyColor('모아페이 주식회사')).toBe('#1F3A8A')
    expect(companyColor('누리클라우드')).toBe('#2B8A3E')
  })

  it('keeps the shared hash for unknown companies', () => {
    expect(companyColor('핀다')).toBe('#0E7A5F')
  })

  it('uses the board colour for the people the boards draw, else a board palette colour', () => {
    expect(personColor('김서준')).toBe('#3B5BDB')
    expect(personColor('오지현')).toBe('#E8590C')
    expect(personColor('홍길동')).toMatch(/^#[0-9A-F]{6}$/)
  })

  it('draws the board gradient recipe', () => {
    expect(brandGradient('#1F3A8A')).toBe('linear-gradient(140deg, #1F3A8A 0%, color-mix(in srgb, #1F3A8A 55%, #000) 100%)')
  })
})
