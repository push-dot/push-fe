import { describe, expect, it } from 'vitest'
import { conditionsFromText, draftFields, listFromLines, textFromConditions } from './posting-draft'

describe('posting draft fields', () => {
  it('joins requirement lines and string work conditions into the editor fields', () => {
    expect(
      draftFields({
        title: '시니어 백엔드',
        description: '결제 API를 만들어요',
        requirements: ['Kotlin', 'Spring'],
        preferred: '금융 도메인',
        workConditions: { 근무: '주 5일', 보상: '연봉 협의', 숨김: 1 },
      }),
    ).toEqual({
      title: '시니어 백엔드',
      description: '결제 API를 만들어요',
      requirements: 'Kotlin\nSpring',
      preferred: '금융 도메인',
      workConditions: '주 5일\n연봉 협의',
    })
  })

  it('stores the condition textarea as one 조건 value and drops blank lines', () => {
    expect(listFromLines('Kotlin\n\n Spring \n')).toEqual(['Kotlin', 'Spring'])
    expect(conditionsFromText('주 5일')).toEqual({ 조건: '주 5일' })
    expect(textFromConditions('이미 문장')).toBe('이미 문장')
  })
})
