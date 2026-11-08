import { describe, expect, it, vi } from 'vitest'
import { inputMetrics, inputReset, IOS_TYPED_TEXT_RAISE, typedTextShift } from '../text-field-metrics'

vi.mock('react-native', () => ({ Platform: { OS: 'android' } }))

describe('text field input height', () => {
  it('keeps the pre-scaling heights at font scale 1.0', () => {
    expect(inputMetrics(true, 1)).toEqual({ ...inputReset, lineHeight: 24, minHeight: 96 })
    expect(inputMetrics(false, 1)).toEqual({ ...inputReset, minHeight: 24 })
  })

  it('grows multiline by its four rows and single line by one at large text', () => {
    expect(inputMetrics(true, 1.3).minHeight).toBeCloseTo(4 * 24 * 1.3)
    expect(inputMetrics(false, 2)).toEqual({ ...inputReset, minHeight: 48 })
  })

  it('zeroes the Android EditText padding on every input', () => {
    expect(inputReset).toEqual({ padding: 0, includeFontPadding: false })
    expect(inputMetrics(false, 1)).toMatchObject(inputReset)
    expect(inputMetrics(true, 1)).toMatchObject(inputReset)
  })

  it('raises typed multiline text on iOS only, never the placeholder or single line', () => {
    expect(typedTextShift(true, true, 'ios')).toEqual({ transform: [{ translateY: -IOS_TYPED_TEXT_RAISE }] })
    expect(typedTextShift(true, false, 'ios')).toBeUndefined()
    expect(typedTextShift(false, true, 'ios')).toBeUndefined()
    expect(typedTextShift(true, true, 'android')).toBeUndefined()
  })
})
