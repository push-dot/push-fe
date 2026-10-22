import { describe, expect, it } from 'vitest'
import { digitsOf, formatBno, formatStartDt } from './verify-input'

describe('verify input', () => {
  it('shows a business number as 3-2-5 and keeps ten digits', () => {
    expect(formatBno('2148703921')).toBe('214-87-03921')
    expect(formatBno('214-87-03921')).toBe('214-87-03921')
    expect(digitsOf(formatBno('214870392199'))).toBe('2148703921')
  })

  it('shows an opening date as YYYY. MM. DD and keeps eight digits', () => {
    expect(formatStartDt('20190304')).toBe('2019. 03. 04')
    expect(formatStartDt('2019. 03. 04')).toBe('2019. 03. 04')
    expect(digitsOf(formatStartDt('2019030499'))).toBe('20190304')
  })
})
