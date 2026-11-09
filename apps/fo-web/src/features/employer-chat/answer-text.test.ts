import { describe, expect, it } from 'vitest'
import { answerParts, questionsText } from './answer-text'

describe('answerParts', () => {
  it('turns numbered paragraphs into one question list with their check lines', () => {
    const text = '질문 5개예요.\n\n1. 직접 바꾼 코드를 설명해 주세요.\n확인할 점 · 본인 기여를 구분하는지\n\n2. 중복 메시지를 어떻게 막았나요?'
    expect(answerParts(text)).toEqual([
      { kind: 'para', text: '질문 5개예요.' },
      {
        kind: 'questions',
        items: [
          { n: '1', text: '직접 바꾼 코드를 설명해 주세요.', check: '본인 기여를 구분하는지' },
          { n: '2', text: '중복 메시지를 어떻게 막았나요?' },
        ],
      },
    ])
  })

  it('keeps the text around a posting draft fence in order', () => {
    const draft = { title: '백엔드', description: '결제 API', requirements: ['서버'], preferred: [], workConditions: {} }
    const text = ['썼어요.', '```posting-draft', JSON.stringify(draft), '```', '고칠까요?'].join('\n')
    expect(answerParts(text).map((part) => part.kind)).toEqual(['para', 'draft', 'para'])
  })

  it('copies questions back as plain text', () => {
    expect(questionsText([{ n: '1', text: '질문', check: '점' }, { n: '2', text: '다음' }])).toBe('1. 질문\n확인할 점 · 점\n\n2. 다음')
  })
})
