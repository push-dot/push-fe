import type { StreamEvent } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { applyEvent, emptyChat } from '../utils/reducer'
import { fromStream, mapEvent } from '../utils/stream'
import { sectionAnswer, submitLabelFor } from '../utils/stream-v3'
import type { Approval, ChatItem } from '../types'

const profile = (): ChatItem => ({
  type: 'result',
  id: 'result-d1',
  source: 'profile',
  taskLine: '프로필 수정',
  checklist: [],
  documentId: 'd1',
  actions: [{ id: 'view', label: '프로필 보기' }],
  name: '김서준',
  headline: '백엔드',
  title: '김서준 · 백엔드',
  subtitle: 'Push 프로필',
})

describe('stream v3', () => {
  it('drops an unknown type and keeps the next frame', async () => {
    expect(mapEvent({ type: 'nope' } as unknown as StreamEvent)).toEqual([])
    async function* frames(): AsyncGenerator<StreamEvent> {
      yield { type: 'nope' } as unknown as StreamEvent
      yield { type: 'token', text: '계속', seq: 1 }
      yield { type: 'done', operation: null, seq: 2 }
    }
    const out = []
    for await (const event of fromStream(frames(), async function* () {})) out.push(event)
    expect(out.map((event) => event.type)).toEqual(['token', 'done'])
  })

  it('maps think', () => {
    expect(mapEvent({ type: 'think', seconds: 6, phase: 'strategy', seq: 3 })).toEqual([{ type: 'think', id: 'think-3', seconds: 6 }])
  })

  it('maps plan', () => {
    const [item] = mapEvent({
      type: 'plan',
      id: 'strategy',
      title: '수정 전략',
      meta: '섹션 2개',
      rows: [
        { tag: '강화', label: '경력', note: '성과를 앞으로' },
        { tag: '기타', label: '소개', note: '짧게' },
      ],
      keywords: ['결제'],
      seq: 4,
    })
    expect(item).toMatchObject({
      type: 'plan',
      id: 'strategy',
      keywords: ['결제'],
      rows: [
        { tag: '강화', tone: 'ac', label: '경력' },
        { tag: '기타', tone: 'grey', label: '소개' },
      ],
    })
  })

  it('maps paper', () => {
    expect(mapEvent({ type: 'paper', id: 'draft-resume-v1', label: '이력서 초안 v1', heading: '김서준', lines: ['한 줄'], seq: 1 })).toEqual([
      { type: 'paper', id: 'draft-resume-v1', label: '이력서 초안 v1', heading: '김서준', lines: ['한 줄'] },
    ])
  })

  it('multi-section choice skips the number list', () => {
    const [ev] = mapEvent({
      type: 'choice',
      id: 'g',
      title: '어떤 산출물을 만들까요?',
      options: [{ id: 'resume', label: '이력서' }],
      sections: [
        { id: 'targets', kind: 'chips', title: '어떤 산출물을 만들까요?', multiple: true, options: [{ id: 'resume', label: '이력서' }], selected: ['resume'] },
        { id: 'materials', kind: 'rows', title: '가져올 자료', options: [{ id: 'm1', label: '파일.pdf', sub: '마이 › 서류', action: 'change' }] },
        { id: 'later', kind: 'later' },
      ],
      submit: { label: '다음' },
    } as StreamEvent)
    expect(ev).toMatchObject({ type: 'approval' })
    if (ev?.type !== 'approval') return
    expect(ev.approval.sections.map((s) => s.kind)).toEqual(['chips', 'rows'])
    expect(ev.approval.optionIds).not.toContain('m1')
    expect(ev.approval.sections.some((s) => s.kind === 'choices')).toBe(false)
    expect(ev.approval.submit).toBe('다음')
  })

  it('template submit label follows the selected thumbnail', () => {
    const approval: Approval = {
      id: 'r',
      question: '디자인',
      sections: [],
      submit: '만들기',
      submitLabels: { CLASSIC: '클래식으로 만들기', MODERN: '모던으로 만들기' },
      zeroSubmit: '그대로 디자인으로',
    }
    expect(submitLabelFor(approval, { templateId: 'CLASSIC', toggleCount: 1 })).toBe('클래식으로 만들기')
    expect(submitLabelFor({ ...approval, submit: '{n}개 반영하고 디자인으로' }, { toggleCount: 0 })).toBe('그대로 디자인으로')
    expect(submitLabelFor({ ...approval, submit: '{n}개 반영하고 디자인으로' }, { toggleCount: 2 })).toBe('2개 반영하고 디자인으로')
    expect(sectionAnswer(false, [])).toEqual({ optionId: 'submit', optionIds: ['submit'] })
    expect(sectionAnswer(false, ['CLASSIC', 'photo'])).toEqual({ optionId: 'submit', optionIds: ['submit', 'CLASSIC', 'photo'] })
    expect(sectionAnswer(true, [])).toEqual({ optionId: 'cancel' })
  })

  it('choice without note does not set pendingNote', () => {
    const [ev] = mapEvent({ type: 'choice', id: 'c', title: '확인', options: [{ id: 'ok', label: '확인했어요' }] })
    expect(ev).toMatchObject({ type: 'approval', approval: { sections: [{ kind: 'choices' }] } })
    if (ev?.type !== 'approval') return
    expect(ev.approval.pendingNote).toBeUndefined()
  })

  it('choice note sticks to the profile result', () => {
    const note = 'PDF는 Push 프로필에서 내보낼 수 있어요.'
    const [ev] = mapEvent({ type: 'choice', id: 'c', title: '확인', note, options: [{ id: 'ok', label: '확인했어요' }, { id: 'stop', label: '그만하기' }] })
    if (ev?.type !== 'approval') throw new Error('expected approval')
    let s = applyEvent({ ...emptyChat, items: [profile()] }, ev)
    const card = s.items.find((it) => it.type === 'result' && it.source === 'profile')
    expect(card).toMatchObject({ pendingNote: note })
    s = applyEvent(s, { type: 'answer', text: '확인했어요' })
    const cleared = s.items.find((it) => it.type === 'result' && it.source === 'profile')
    expect(cleared).toMatchObject({ pendingNote: undefined })
  })

  it('answering the choice clears the note', () => {
    const [ev] = mapEvent({
      type: 'choice',
      id: 'c',
      note: '메모',
      options: [{ id: 'ok', label: '확인' }],
      resolution: { status: 'APPROVED', optionId: 'ok' },
    })
    if (ev?.type !== 'approval') throw new Error('expected approval')
    expect(ev.approval.pendingNote).toBeUndefined()
  })
})
