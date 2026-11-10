import type { ConversationTurn, Message, StreamEvent } from '@push/api-client'
import { parsePostingDraft } from '../model/employer-chat'
import { CHAT_SEEDS, DRAFT_REPLY } from './mock-fixtures'

export type ChatScriptName =
  | 'gen'
  | 'draft'
  | 'review'
  | 'interview'
  | 'approve'
  | 'approved'
  | 'rejected'
  | 'tool'
  | 'writing'
  | 'queue'

type TurnEvent = ConversationTurn['events'][number]

type ChatScript = { title: string | null; events: StreamEvent[]; stall: boolean }

const interviewText = CHAT_SEEDS.find((seed) => seed.id === 'c-interview')?.messages[1]?.[1] ?? ''

const GEN: TurnEvent[] = [
  { type: 'token', text: '좋아요. 먼저 모아페이를 찾아보고, 참고 공고와 비교해서 필요한 걸 여쭤볼게요.' },
  {
    type: 'tool',
    name: 'search_company',
    state: 'ok',
    summary: '회사 정보 검색',
    target: 'moapay.kr · 뉴스 · 기존 공고',
    resultLine: '홈페이지 1, 뉴스 4, Push 공고 2건을 읽었어요',
    extra: ['“모아페이, 월 거래액 1조 돌파”(10월 2일) · 결제 플랫폼팀 · 정산팀'],
  },
  {
    type: 'tool',
    name: 'read_posting',
    state: 'ok',
    summary: '참고 공고 읽기',
    target: '누리클라우드 · 백엔드 개발자',
    resultLine: '필수 4개 · 우대 3개 · 1–3년',
  },
  {
    type: 'token',
    text: '모아페이는 결제 승인과 정산을 직접 운영하고, 최근 거래액이 빠르게 늘고 있어요. 참고 공고는 1–3년차 대상이라 그대로 쓰면 연차가 맞지 않을 수 있어요.',
  },
  {
    type: 'choice',
    id: 'need',
    title: '이번에 가장 필요한 사람은 누구예요?',
    recommended: '1',
    options: [
      { id: '1', label: '결제 승인 API를 키울 사람', desc: '트래픽 증가 대응 · 성능 · 장애 대응' },
      { id: '2', label: '정산 파이프라인을 맡을 사람', desc: '배치 → 스트림 전환 · 데이터 정합성' },
      { id: '3', label: '둘 다 볼 수 있는 시니어', desc: '연차 7년 이상 · 리드 경험' },
      { id: '4', label: '직접 말하기' },
    ],
  },
]

const REVIEW: TurnEvent[] = [
  {
    type: 'tool',
    name: 'read_documents',
    state: 'ok',
    summary: '제출 서류 읽기',
    target: '이력서 2쪽 · 포트폴리오 14쪽',
    resultLine: '지원할 때 제출한 그대로예요 (10월 20일)',
  },
  {
    type: 'tool',
    name: 'compare_peers',
    state: 'ok',
    summary: '같은 연차 서류와 비교',
    target: '백엔드 · 5년',
    resultLine: '같은 연차 서류의 구조와 깊이를 기준으로 봤어요',
  },
  { type: 'token', text: '서류 전체는 공고와 잘 맞아요. 다만 아래 세 곳은 면접에서 직접 확인해 보는 게 좋아요.' },
  {
    type: 'plan',
    id: 'feedback',
    title: '서류 검토',
    meta: '확인 필요 2 · 근거 충분 1',
    rows: [
      {
        tag: '확인 필요',
        label: '“p99 420ms → 180ms”의 본인 역할',
        note: '성과 수치는 구체적인데, 무엇을 직접 바꿨는지 설명이 같은 연차 서류보다 짧아요.',
      },
      {
        tag: '확인 필요',
        label: 'Kafka 정산 파이프라인',
        note: '문장 구조는 고급인데, 처리량·장애 사례 같은 빈칸 내용이 구체적이지 않아요.',
      },
      { tag: '근거 충분', label: '결제 승인 API 운영 4년', note: '기간, 트래픽 규모, 장애 회고가 서로 맞아요.' },
    ],
  },
  { type: 'token', text: '합격·불합격은 담당자가 정해요. AI는 확인할 부분만 짚어요.' },
]

const CARRY_REVIEW: TurnEvent = {
  type: 'tool',
  name: 'carry_review',
  state: 'ok',
  summary: '서류 검토 결과 이어받기',
  target: '확인 필요 2곳',
  resultLine: '역할 범위 · Kafka 파이프라인',
}

const INTERVIEW: TurnEvent[] = [CARRY_REVIEW, { type: 'token', text: interviewText }]

const QUESTIONS_INTRO = '면접관 시점에서 서류의 역량이 사실인지 확인하는 질문 5개예요. 확인 필요였던 부분부터 넣었어요.\n\n'

const MOVE_ROWS = [
  { name: '김태윤', initial: '태윤', from: '서류 통과', to: '면접' },
  { name: '이서연', initial: '서연', color: '#C2255C', from: '서류 통과', to: '면접' },
  { name: '최현우', initial: '현우', color: '#0C8093', from: '서류 통과', to: '면접' },
]

const draft = parsePostingDraft(DRAFT_REPLY)

export const CHAT_SCRIPTS: Record<ChatScriptName, ChatScript> = {
  gen: { title: null, stall: false, events: [...GEN, { type: 'done', operation: null, awaiting: 'choice' }] },
  draft: {
    title: null,
    stall: false,
    events: [
      {
        type: 'tool',
        name: 'draft_posting',
        state: 'run',
        summary: '공고 초안 쓰기',
        target: '결제 승인 · 4–6년',
      },
      {
        type: 'tool',
        name: 'draft_posting',
        state: 'ok',
        summary: '공고 초안 쓰기',
        target: '결제 승인 · 4–6년',
        resultLine: '제목 · 하는 일 3 · 자격 요건 3 · 우대 사항 2 · 근무 조건',
        // push-be's draft_posting result is the saved posting, with the facts WebBizAiDraft reads under the title.
        result: { draft: { ...draft, location: '서울 강남구', careerMin: 4, careerMax: 6, employmentType: 'full_time' } },
      },
      {
        type: 'token',
        text: '결제 승인 API를 키울 4–6년차 기준으로 썼어요. 참고 공고의 표현은 옮기지 않고, 모아페이 거래 규모를 넣었어요.',
      },
      { type: 'token', text: '\n\n등록하기 전에 공고 편집에서 고칠 수 있어요. 연봉 범위를 넣을까요?' },
      { type: 'done', operation: null },
    ],
  },
  review: { title: null, stall: false, events: [...REVIEW, { type: 'done', operation: null }] },
  interview: { title: '김태윤 면접 질문', stall: false, events: [...INTERVIEW, { type: 'done', operation: null }] },
  approve: {
    title: '서류 통과 지원자 면접 단계로',
    stall: false,
    events: [
      {
        type: 'tool',
        name: 'find_applicants',
        state: 'run',
        summary: '지원자 찾기',
        target: '결제 승인 백엔드 · 서류 통과',
      },
      {
        type: 'tool',
        name: 'find_applicants',
        state: 'ok',
        summary: '지원자 찾기',
        target: '결제 승인 백엔드 · 서류 통과',
        resultLine: '서류 통과 8명 중 서류 검토에서 확인할 부분이 적었던 3명이에요',
      },
      {
        type: 'token',
        text: '아래 3명을 면접 단계로 옮기려고 해요. 단계를 바꾸면 지원자에게 알림이 가서, 확인을 받고 진행할게요.',
      },
      {
        type: 'approval',
        id: 'ap-stage',
        kind: 'TOOL_ACTION',
        title: '3명을 면접 단계로 옮길까요?',
        toolName: 'move_stage',
        // Raw tool args stay ids. The people the card draws come from rows, with no colour.
        args: { stage: 'INTERVIEW' },
        rows: MOVE_ROWS.map(({ name, initial, from, to }) => ({ name, initial, from, to })),
        foot: '옮기면 세 분에게 “지원 상태 변경” 알림이 가요.',
        options: [
          { id: 'reject', label: '취소' },
          { id: 'approve', label: '옮기기' },
        ],
      },
      { type: 'done', operation: null, awaiting: 'approval' },
    ],
  },
  approved: {
    title: null,
    stall: false,
    events: [
      {
        type: 'tool',
        name: 'move_stage',
        state: 'ok',
        summary: '단계 바꾸기',
        target: '김태윤 · 이서연 · 최현우',
        resultLine: '3명을 면접 단계로 옮겼어요',
      },
      { type: 'token', text: '3명을 면접 단계로 옮겼어요. 지원자에게 알림이 갔어요.' },
      { type: 'done', operation: null },
    ],
  },
  rejected: {
    title: null,
    stall: false,
    events: [{ type: 'token', text: '취소했어요. 단계는 그대로예요.' }, { type: 'done', operation: null }],
  },
  tool: {
    title: '이번 주 새 지원자 정리',
    stall: true,
    events: [
      { type: 'token', text: '좋아요. 이번 주에 들어온 지원자를 공고 기준으로 묶어 볼게요.' },
      {
        type: 'tool',
        name: 'read_applicants',
        state: 'run',
        summary: '지원자 목록 읽기',
        target: '결제 승인 백엔드 · 이번 주',
      },
      {
        type: 'tool',
        name: 'read_applicants',
        state: 'ok',
        summary: '지원자 목록 읽기',
        target: '결제 승인 백엔드 · 이번 주',
        resultLine: '새 지원자 9명이에요 · 프로필 6 · PDF 5',
      },
      { type: 'tool', name: 'read_documents', state: 'run', summary: '제출 서류 읽는 중', target: '4 / 9명' },
    ],
  },
  writing: {
    title: '김태윤 면접 질문',
    stall: true,
    events: [
      CARRY_REVIEW,
      { type: 'token', text: QUESTIONS_INTRO },
      {
        type: 'token',
        text: '1. p99를 180ms로 줄일 때 직접 바꾼 코드나 설정을 하나 골라 설명해 주세요.\n확인할 점 · 팀 성과와 본인 기여를 구분하는지, 측정 방법을 아는지\n\n',
      },
      { type: 'token', text: '2. 정산 파이프라인에서 메시지가 중복으로 들어왔을 때' },
    ],
  },
  queue: {
    title: '김태윤 서류 검토',
    stall: true,
    events: [{ type: 'status', text: 'queued', ahead: 3 } as StreamEvent],
  },
}

const turn = (id: string, events: TurnEvent[]): ConversationTurn => ({
  jobId: `job-${id}`,
  status: 'DONE',
  createdAt: CHAT_SEEDS.find((seed) => seed.id === id)?.updatedAt ?? '',
  userMessageId: `${id}-m1`,
  assistantMessageId: `${id}-m2`,
  answer: null,
  events,
})

export const CHAT_TURNS: Record<string, ConversationTurn[]> = {
  'c-ref': [turn('c-ref', GEN)],
  'c-review': [turn('c-review', REVIEW)],
  'c-interview': [turn('c-interview', INTERVIEW)],
}

const TAEYOON: Message['attachments'] = [{ type: 'APPLICATION', id: 'app-2', title: '김태윤', documentTitles: ['이력서', '포트폴리오'] }]

export const CHAT_SEED_ATTACHMENTS: Record<string, Message['attachments']> = {
  'c-ref': [{ type: 'POSTING', id: 'p9', title: '백엔드 개발자' }],
  'c-review': TAEYOON,
  'c-interview': TAEYOON,
}
