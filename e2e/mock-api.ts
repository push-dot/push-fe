import type { Page } from '@playwright/test'

const PAGE = { nextCursor: null, hasMore: false }

const now = () => new Date().toISOString()

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

const data = (value: unknown) => json({ data: value })
const list = (rows: unknown[] = []) => json({ data: rows, page: PAGE })

type Conversation = {
  id: string
  revision: number
  applicationId: string | null
  title: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

type Message = {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  text: string
  attachments: unknown[]
  operationId: string | null
  createdAt: string
}

export type MockApiOptions = {
  /** Hold the stream POST open (never sends frames) so the abort button stays visible. */
  holdStream?: boolean
}

const AI_MODELS = [
  {
    provider: 'OPENAI',
    model: 'openai/gpt-5-mini',
    label: 'GPT-5 mini',
    available: true,
    supportedEfforts: ['LOW', 'MEDIUM', 'HIGH'],
  },
  {
    provider: 'OPENAI',
    model: 'openai/gpt-5',
    label: 'GPT-5',
    available: true,
    supportedEfforts: ['LOW', 'MEDIUM', 'HIGH'],
  },
  {
    provider: 'OPENROUTER',
    model: 'deepseek/deepseek-chat',
    label: 'DeepSeek Chat',
    available: true,
    supportedEfforts: ['LOW', 'MEDIUM'],
  },
]

export const installApiMocks = async (
  page: Page,
  options: MockApiOptions = {},
): Promise<void> => {
  const conversations = new Map<string, Conversation>()
  const messagesByConv = new Map<string, Message[]>()
  let convCounter = 0
  let msgCounter = 0
  let opCounter = 0

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const method = request.method()
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1\/?/, '')
    const seg = path.split('/').filter(Boolean)
    const body = () => {
      try {
        return (request.postDataJSON() ?? {}) as Record<string, unknown>
      } catch {
        return {}
      }
    }

    // --- conversations ---
    if (method === 'GET' && path === 'conversations') {
      return route.fulfill(list([...conversations.values()]))
    }
    if (method === 'POST' && path === 'conversations') {
      const b = body()
      convCounter += 1
      const conv: Conversation = {
        id: `conv-${convCounter}`,
        revision: 1,
        applicationId: (b.applicationId as string | null) ?? null,
        title: (b.title as string) ?? '새 채팅',
        pinned: false,
        createdAt: now(),
        updatedAt: now(),
      }
      conversations.set(conv.id, conv)
      messagesByConv.set(conv.id, [])
      return route.fulfill(data(conv))
    }
    const convMatch = path.match(/^conversations\/([^/]+)(?:\/(.*))?$/)
    if (convMatch) {
      const [, convId, sub = ''] = convMatch
      if (method === 'PATCH' && sub === '') {
        const b = body()
        const prev = conversations.get(convId) ?? {
          id: convId,
          revision: 1,
          applicationId: null,
          title: '',
          pinned: false,
          createdAt: now(),
          updatedAt: now(),
        }
        const updated: Conversation = {
          ...prev,
          title: (b.title as string) ?? prev.title,
          pinned: (b.pinned as boolean) ?? prev.pinned,
          revision: prev.revision + 1,
          updatedAt: now(),
        }
        conversations.set(convId, updated)
        return route.fulfill(data(updated))
      }
      if (method === 'POST' && sub === 'archive') {
        const conv = conversations.get(convId)
        conversations.delete(convId)
        return route.fulfill(data(conv ?? { id: convId, revision: 0 }))
      }
      // the store renders messages oldest-first; the list endpoint serves newest-first
      if (method === 'GET' && sub === 'messages') {
        return route.fulfill(list([...(messagesByConv.get(convId) ?? [])].reverse()))
      }
      if (method === 'GET' && sub === 'messages/stream/active') {
        return route.fulfill({ status: 204 })
      }
      if (method === 'POST' && sub === 'messages/stream') {
        if (options.holdStream) {
          // keep the request in-flight so the stop button stays clickable
          try {
            await new Promise((r) => setTimeout(r, 30_000))
            await route.fulfill({ status: 200, contentType: 'text/event-stream', body: '' })
          } catch {
            // request aborted by the page — expected
          }
          return
        }
        const text = (body().text as string) ?? ''
        msgCounter += 2
        opCounter += 1
        const opId = `op-${opCounter}`
        const userMessage: Message = {
          id: `msg-${msgCounter - 1}`,
          conversationId: convId,
          role: 'USER',
          text,
          attachments: [],
          operationId: opId,
          createdAt: now(),
        }
        const assistantMessage: Message = {
          id: `msg-${msgCounter}`,
          conversationId: convId,
          role: 'ASSISTANT',
          text: 'mock 응답입니다.',
          attachments: [],
          operationId: opId,
          createdAt: now(),
        }
        const operation = {
          id: opId,
          type: 'CHAT_MESSAGE',
          applicationId: null,
          status: 'SUCCEEDED',
          progress: 1,
          result: {
            kind: 'CHAT_MESSAGE',
            value: { userMessage, assistantMessage, approvalIds: [] },
          },
          error: null,
          inputRequest: null,
          createdAt: now(),
          updatedAt: now(),
        }
        const stored = messagesByConv.get(convId) ?? []
        messagesByConv.set(convId, [...stored, userMessage, assistantMessage])
        const frames = [
          { type: 'token', text: 'mock ', seq: 1 },
          { type: 'token', text: '응답입니다.', seq: 2 },
          { type: 'done', operation, seq: 3 },
        ]
        const sse = frames.map((f) => `data: ${JSON.stringify(f)}`).join('\n\n') + '\n\n'
        return route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: sse,
        })
      }
    }

    // --- session / settings ---
    if (method === 'GET' && path === 'auth/me') {
      return route.fulfill(
        data({
          id: '00000000-0000-4000-8000-000000000001',
          displayName: 'Dev',
          locale: 'ko',
          createdAt: now(),
        }),
      )
    }
    if (method === 'POST' && path === 'auth/refresh') {
      return route.fulfill(
        data({
          accessToken: 'dev-token',
          refreshToken: 'dev-refresh',
          expiresIn: 86400,
          user: {
            id: '00000000-0000-4000-8000-000000000001',
            displayName: 'Dev',
            locale: 'ko',
          },
        }),
      )
    }
    if (method === 'GET' && path === 'billing') {
      return route.fulfill(
        data({
          subscriptionStatus: 'ACTIVE',
          plan: 'FREE',
          periodEndsAt: null,
          balanceMicroCredits: 0,
          reservedMicroCredits: 0,
        }),
      )
    }
    if (method === 'GET' && path === 'ai/models') {
      return route.fulfill(list(AI_MODELS))
    }
    const expMatch = path.match(/^experiments\/([^/]+)\/(assignment|events)$/)
    if (expMatch) {
      if (method === 'GET' && expMatch[2] === 'assignment') {
        return route.fulfill(
          data({
            experimentKey: expMatch[1],
            variant: 'A',
            enrolled: false,
            createdAt: now(),
          }),
        )
      }
      if (method === 'POST' && expMatch[2] === 'events') {
        return route.fulfill(data({ recorded: true }))
      }
    }

    // --- documents ---
    if (method === 'GET' && path === 'documents') {
      return route.fulfill(
        list([
          {
            id: 'doc-1',
            revision: 1,
            applicationId: 'app-1',
            title: '이력서',
            kind: 'RESUME',
            template: 'CLASSIC',
            language: 'ko',
            status: 'DRAFT',
            latestVersionId: null,
            finalizedVersionId: null,
            createdAt: now(),
            updatedAt: now(),
          },
        ]),
      )
    }

    // --- other collections the app loads at boot ---
    if (method === 'GET' && path === 'applications') {
      return route.fulfill(list())
    }
    if (method === 'GET' && path === 'calendar/events') {
      return route.fulfill(list())
    }
    if (method === 'GET' && path === 'career-evidence') {
      return route.fulfill(list())
    }

    // --- uploads ---
    if (method === 'POST' && path === 'sources') {
      return route.fulfill(
        data({
          id: 'src-1',
          fileName: 'resume.pdf',
          mimeType: 'application/pdf',
          size: 0,
          sha256: 'e2e-mock',
          status: 'UPLOADED',
        }),
      )
    }
    if (method === 'POST' && path === 'career-evidence/import') {
      const b = body()
      return route.fulfill(
        data({
          id: `op-import-${++opCounter}`,
          type: 'EVIDENCE_IMPORT',
          applicationId: null,
          status: 'SUCCEEDED',
          progress: 1,
          result: {
            value: {
              evidence: [
                {
                  id: 'ev-1',
                  revision: 1,
                  createdAt: now(),
                  updatedAt: now(),
                  kind: 'RESUME',
                  title: (b.title as string) ?? 'resume.pdf',
                  sourceText: '',
                  sourceUrl: null,
                  skills: [],
                  verificationStatus: 'PENDING',
                  provenance: {
                    sourceId: (b.sourceId as string) ?? null,
                    projectEvidenceId: null,
                    contentHash: '',
                    sourceLocation: null,
                  },
                },
              ],
            },
          },
          error: null,
          inputRequest: null,
          createdAt: now(),
          updatedAt: now(),
        }),
      )
    }

    // --- catch-all: empty list for collection GETs, empty data otherwise ---
    console.warn(`[mock-api] unhandled ${method} /api/v1/${path}`)
    if (method === 'GET') {
      return route.fulfill(seg.length > 1 ? data({}) : list())
    }
    return route.fulfill(data({}))
  })
}
