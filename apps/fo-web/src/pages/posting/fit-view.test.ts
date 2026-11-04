import { describe, expect, it } from 'vitest'
import { FIT_LOCK, FIT_PART_LABELS, fitCardModel, loadPostingFit, type FitPayload } from './fit-view'

const payload = (plan: string): FitPayload => ({
  fitScore: 6.9,
  parts: { techStack: 8.2, experienceLink: 7.4, careerLevel: 6, keyword: 4.5, domain: 5 },
  topGap: '도메인',
  plan,
})

const client = (plan: string, statuses: string[] = ['DONE']) => {
  const queue = [...statuses]
  return {
    listDocuments: async () => ({ data: [{ id: 'd1', title: '김서준_백엔드_이력서_2026' }] }),
    startFit: async () => ({ jobId: 'j1' }),
    readJob: async () => ({ status: queue.length > 1 ? queue.shift()! : queue[0]!, result: payload(plan) }),
  }
}

describe('fit card', () => {
  it('locks the five parts on FREE and keeps the total', async () => {
    const model = await loadPostingFit('p1', client('FREE'), async () => {})
    expect(model?.score).toBe(6.9)
    expect(model?.locked).toBe(true)
    expect(model?.weakness).toBeNull()
    expect(model?.parts.map((part) => part.label)).toEqual([...FIT_PART_LABELS])
    expect(model?.parts.every((part) => part.value === null)).toBe(true)
    expect(JSON.stringify(model)).not.toContain('%')
    expect(FIT_LOCK).toBe('PRO로 올리면 항목별 점수와 약점을 볼 수 있어요')
  })

  it('shows every part score on PRO and ULTRA', () => {
    for (const plan of ['PRO', 'ULTRA']) {
      const model = fitCardModel(payload(plan), '이력서')
      expect(model.locked).toBe(false)
      expect(model.parts.map((part) => part.value)).toEqual([8.2, 7.4, 6, 4.5, 5])
      expect(model.weakness).toBe('도메인')
      expect(JSON.stringify(model)).not.toContain('%')
    }
  })

  it('stays empty until a document and a finished job exist', async () => {
    const empty = await loadPostingFit(
      'p1',
      { listDocuments: async () => ({ data: [] }), startFit: async () => ({ jobId: 'j' }), readJob: async () => ({ status: 'DONE', result: payload('PRO') }) },
      async () => {},
    )
    expect(empty).toBeNull()
    const failed = await loadPostingFit('p1', client('PRO', ['FAILED']), async () => {})
    expect(failed).toBeNull()
    const polled = await loadPostingFit('p1', client('PRO', ['RUNNING', 'DONE']), async () => {})
    expect(polled?.locked).toBe(false)
    expect(polled?.document).toBe('김서준_백엔드_이력서_2026')
  })
})
