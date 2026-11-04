import { JOB_POLL_MS } from '@push/api-client'

const FIT_PARTS = [
  ['techStack', '기술 스택'],
  ['experienceLink', '경험 연관성'],
  ['careerLevel', '경력 수준'],
  ['keyword', '키워드'],
  ['domain', '도메인'],
] as const

export const FIT_PART_LABELS = FIT_PARTS.map((part) => part[1])
export const FIT_LOCK = 'PRO로 올리면 항목별 점수와 약점을 볼 수 있어요'
export const FIT_SOON = '적합도는 곧 볼 수 있어요'
export const FIT_COMPARING = '공고와 서류를 비교하는 중…'

export type FitPayload = {
  fitScore: number
  parts: Record<(typeof FIT_PARTS)[number][0], number>
  topGap: string
  plan: string
}

export type FitCardModel = {
  document: string
  score: number
  parts: { label: string; value: number | null }[]
  weakness: string | null
  locked: boolean
  reachable?: number
}

type FitClient = {
  listDocuments: () => Promise<{ data: { id: string; title: string }[] }>
  startFit: (postingId: string, documentId: string) => Promise<{ jobId: string }>
  readJob: (id: string) => Promise<{ status: string; result: FitPayload | null }>
}

const planOf = (plan: string) => (plan === 'PRO' || plan === 'ULTRA' ? plan : 'FREE')

export const fitCardModel = (payload: FitPayload, document: string): FitCardModel => {
  const locked = planOf(payload.plan) === 'FREE'
  return {
    document,
    score: payload.fitScore,
    locked,
    weakness: locked ? null : payload.topGap || null,
    parts: FIT_PARTS.map(([key, label]) => ({
      label,
      value: locked ? null : payload.parts[key],
    })),
  }
}

const settled = new Set(['DONE', 'FAILED', 'DEAD', 'CANCELLED'])

export const loadPostingFit = async (
  postingId: string,
  client: FitClient,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<FitCardModel | null> => {
  try {
    const page = await client.listDocuments()
    const doc = page.data[0]
    if (!doc) return null
    const { jobId } = await client.startFit(postingId, doc.id)
    for (;;) {
      const job = await client.readJob(jobId)
      if (job.status === 'DONE') return job.result ? fitCardModel(job.result, doc.title) : null
      if (settled.has(job.status)) return null
      await sleep(JOB_POLL_MS)
    }
  } catch {
    return null
  }
}
