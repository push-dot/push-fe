import { describe, expect, it } from 'vitest'
import { answerParts, questionsText } from './answer-text'

describe('answerParts', () => {
  it('turns numbered paragraphs into one question list with their check lines', () => {
    const text =
      '질문 5개예요.\n\n1. 직접 바꾼 코드를 설명해 주세요.\n확인할 점 · 본인 기여를 구분하는지\n\n2. 중복 메시지를 어떻게 막았나요?'
    expect(answerParts(text)).toEqual([
      { kind: 'para', text: '질문 5개예요.' },
      {
        kind: 'questions',
        items: [
          { n: '1', text: '직접 바꾼 코드를 설명해 주세요.', check: '본인 기여를 구분하는지' },
          { n: '2', text: '중복 메시지를 어떻게 막았나요?' },
        ],
        raw: [
          '1. 직접 바꾼 코드를 설명해 주세요.\n확인할 점 · 본인 기여를 구분하는지',
          '2. 중복 메시지를 어떻게 막았나요?',
        ],
      },
    ])
  })

  it('keeps every item of a numbered block and leaves a list without check lines as text', () => {
    expect(answerParts('고르세요.\n\n1. 결제 승인\n2. 정산\n3. 둘 다')).toEqual([
      { kind: 'para', text: '고르세요.' },
      { kind: 'para', text: '1. 결제 승인\n2. 정산\n3. 둘 다' },
    ])
    expect(answerParts('1. 첫 질문\n확인할 점 · 하나\n2. 둘째 질문').at(0)).toMatchObject({
      kind: 'questions',
      items: [
        { n: '1', text: '첫 질문', check: '하나' },
        { n: '2', text: '둘째 질문' },
      ],
    })
  })

  it('keeps the plain and nested lines under a numbered line', () => {
    const text = '1. 첫 질문\n이어서 설명해요\n- 하위 항목\n확인할 점 · 하나\n2. 둘째 질문'
    const [part] = answerParts(text)
    expect(part).toMatchObject({
      kind: 'questions',
      items: [{ n: '1', text: '첫 질문', note: '이어서 설명해요\n- 하위 항목', check: '하나' }, { n: '2', text: '둘째 질문' }],
    })
    expect(questionsText((part as Extract<typeof part, { kind: 'questions' }>).items)).toContain('- 하위 항목')
  })

  it('shows a numbered list without check lines exactly as written', () => {
    const text = '1. 결제 승인\n결제 흐름을 말해요\n   - 승인 취소\n2. 정산'
    expect(answerParts(text)).toEqual([{ kind: 'para', text }])
  })

  it('does not read a date at the start of a paragraph as a numbered list', () => {
    const text = '2026. 11. 10. 기준으로 정리했어요.\n다음 줄도 그대로 보여요.'
    expect(answerParts(text)).toEqual([{ kind: 'para', text }])
  })

  it('never drops a word from any mix of numbered lines, notes, dates and check lines', () => {
    const lines = [
      '1. 첫 질문',
      '2. 둘째 질문',
      '10. 열 번째 질문',
      '설명 줄 하나',
      '- 하위 항목 가',
      '  - 더 깊은 항목 나',
      '확인할 점 · 근거를 보는지',
      '2026. 11. 10. 기준 문단',
      '11. 10. 2026 순서',
      '',
    ]
    const strip = (value: string) =>
      value
        .replace(/^확인할 점\s*·\s*/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .split(/\s+/)
        .filter(Boolean)
        .sort()
    const flat = (text: string) =>
      answerParts(text)
        .flatMap((part) =>
          part.kind === 'questions'
            ? part.items.flatMap((item) => [item.text, item.note ?? '', item.check ?? ''])
            : part.kind === 'para'
              ? [part.text]
              : [],
        )
        .join('\n')
    let seed = 7
    const next = (max: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed % max
    }
    for (let round = 0; round < 300; round += 1) {
      const text = Array.from({ length: 1 + next(8) }, () => lines[next(lines.length)]).join('\n')
      expect(strip(flat(text)), JSON.stringify(text)).toEqual(strip(text))
    }
  })

  it('keeps the text around a posting draft fence in order', () => {
    const draft = {
      title: '백엔드',
      description: '결제 API',
      requirements: ['서버'],
      preferred: [],
      workConditions: {},
    }
    const text = ['썼어요.', '```posting-draft', JSON.stringify(draft), '```', '고칠까요?'].join(
      '\n',
    )
    expect(answerParts(text).map((part) => part.kind)).toEqual(['para', 'draft', 'para'])
  })

  it('copies questions back as plain text', () => {
    expect(
      questionsText([
        { n: '1', text: '질문', check: '점' },
        { n: '2', text: '다음' },
      ]),
    ).toBe('1. 질문\n확인할 점 · 점\n\n2. 다음')
  })
})
