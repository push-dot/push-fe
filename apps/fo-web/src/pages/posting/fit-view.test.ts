import { describe, expect, it } from 'vitest'
import { FIT_LOCK, FIT_PART_LABELS, firstDocument, fitCardModel, fitStatus, runPostingFit, type FitPayload } from './fit-view'

const payload = (plan: string): FitPayload => ({
  fitScore: 6.9,
  parts: { techStack: 8.2, experienceLink: 7.4, careerLevel: 6, keyword: 4.5, domain: 5 },
  topGap: '도메인',
  plan,
})

const doc = { id: 'd1', title: '김서준_백엔드_이력서_2026' }

const client = (plan: string, statuses: string[] = ['DONE']) => {
  const queue = [...statuses]
  return {
    listDocuments: async () => ({ data: [doc] }),
    startFit: async () => ({ jobId: 'j1' }),
    readJob: async () => ({ status: queue.length > 1 ? queue.shift()! : queue[0]!, result: payload(plan) }),
  }
}

const noSleep = async () => {}

describe('fit card', () => {
  it('locks the five parts on FREE and keeps the total', async () => {
    const model = await runPostingFit('p1', doc, client('FREE'), noSleep)
    expect(model?.score).toBe(6.9)
    expect(model?.locked).toBe(true)
    expect(model?.weakness).toBeNull()
    expect(model?.parts.map((part) => part.label)).toEqual([...FIT_PART_LABELS])
    expect(model?.parts.every((part) => part.value === null)).toBe(true)
    expect(JSON.stringify(model)).not.toContain('%')
    expect(FIT_LOCK).toBe('🔒 PRO로 올리면 항목별 점수와 약점을 볼 수 있어요')
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

  it('turns reachable into the next score band on PRO and ULTRA', () => {
    expect(fitCardModel({ ...payload('PRO'), reachable: 8.2 }, '이력서').reachable).toBe(8)
    expect(fitCardModel({ ...payload('ULTRA'), reachable: 7 }, '이력서').reachable).toBe(7)
  })

  it('hides reachable on FREE, in the same band, or when the server leaves it out', () => {
    expect(fitCardModel({ ...payload('FREE'), reachable: 8.2 }, '이력서').reachable).toBeUndefined()
    expect(fitCardModel({ ...payload('PRO'), reachable: 6.95 }, '이력서').reachable).toBeUndefined()
    expect(fitCardModel(payload('PRO'), '이력서').reachable).toBeUndefined()
  })

  it('finds the newest document or none', async () => {
    expect(await firstDocument(client('PRO'))).toEqual(doc)
    expect(await firstDocument({ ...client('PRO'), listDocuments: async () => ({ data: [] }) })).toBeNull()
    expect(await firstDocument({ ...client('PRO'), listDocuments: async () => Promise.reject(new Error('401')) })).toBeNull()
  })

  it('stays empty until the job finishes', async () => {
    expect(await runPostingFit('p1', doc, client('PRO', ['FAILED']), noSleep)).toBeNull()
    const polled = await runPostingFit('p1', doc, client('PRO', ['RUNNING', 'DONE']), noSleep)
    expect(polled?.locked).toBe(false)
    expect(polled?.document).toBe('김서준_백엔드_이력서_2026')
  })
})

describe('fitStatus', () => {
  const ready = fitCardModel(payload('PRO'), doc.title)
  const locked = fitCardModel(payload('FREE'), doc.title)

  it('compares while the document or the job is still loading', () => {
    expect(fitStatus({ documentPending: true, document: undefined, fitPending: true, fit: undefined })).toBe('comparing')
    expect(fitStatus({ documentPending: false, document: doc, fitPending: true, fit: undefined })).toBe('comparing')
  })

  it('says soon without a document or a result', () => {
    expect(fitStatus({ documentPending: false, document: null, fitPending: true, fit: undefined })).toBe('soon')
    expect(fitStatus({ documentPending: false, document: doc, fitPending: false, fit: null })).toBe('soon')
  })

  it('locks on FREE and shows the result otherwise', () => {
    expect(fitStatus({ documentPending: false, document: doc, fitPending: false, fit: locked })).toBe('locked')
    expect(fitStatus({ documentPending: false, document: doc, fitPending: false, fit: ready })).toBe('ready')
  })
})
