import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { toPostingDraft } from '../../shared/model/employer-chat'
import { ChatActionsContext, type ChatActions } from './chat-actions'
import ChatApp from './chat-app'
import ChatDraftCard from './chat-draft-card'
import ChatToolRow from './chat-tool-row'
import ChatUser from './chat-user'

const actions = (people: ChatActions['people']): ChatActions => ({
  busy: false,
  picked: {},
  people,
  send: () => undefined,
  answer: () => undefined,
  focus: () => undefined,
  redraft: () => undefined,
  copied: () => undefined,
})

describe('chat rows', () => {
  it('ends a tool row the job stopped with 멈췄어요 instead of a loading line', () => {
    const html = renderToStaticMarkup(
      <ChatToolRow tool={{ kind: 'tool', key: 'k', name: 'list', state: 'stop', summary: '지원자 보기' }} />,
    )
    expect(html).toContain('멈췄어요')
    expect(html).not.toContain('chat-tool-wait')
    expect(html).not.toContain('chat-spin')
  })

  it('names the applicant only: push-be sends nothing about which documents were attached', () => {
    const html = renderToStaticMarkup(
      <ChatActionsContext.Provider
        value={actions([{ applicationId: 'a1', name: '김태윤', postingId: 'p1', postingTitle: '백엔드' }])}
      >
        <ChatUser text="검토해 줘" attachments={[{ type: 'APPLICATION', id: 'a1' }]} />
      </ChatActionsContext.Provider>,
    )
    expect(html).toContain('>김태윤<')
    expect(html).not.toContain('포트폴리오')
  })

  it('puts the company, place, career and type line under the draft title', () => {
    const client = new QueryClient()
    client.setQueryData(['company', 'me'], { name: '모아페이' })
    const draft = toPostingDraft({
      title: '결제 승인 백엔드 엔지니어',
      description: '결제 API',
      requirements: [],
      preferred: [],
      workConditions: { workStyle: '주 3일 출근', employmentType: 'FULL_TIME' },
      location: '서울 강남구',
      careerMin: 4,
      careerMax: 6,
    })
    if (!draft) throw new Error('draft did not parse')
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ChatDraftCard draft={draft} />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(html).toContain('모아페이 · 서울 강남구 · 경력 4–6년 · 정규직')
    expect(html).toContain('주 3일 출근')
    expect(html).not.toContain('FULL_TIME')
  })

  it('keeps the thread out of the live region so loading a conversation reads nothing, and reads the reply once', () => {
    const html = renderToStaticMarkup(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ChatApp screen="thread" activeId="c1" announce="답변이에요">
            <p>저장된 대화</p>
          </ChatApp>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(html).not.toContain('role="log"')
    expect(html).not.toContain('aria-live')
    expect(html).toContain('<p class="sr-only" role="status">답변이에요</p>')
  })
})
