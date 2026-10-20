// Shapes follow docs/api-spec.md. Section 4 (v2) is an unconfirmed draft.

export type PageInfo = { nextCursor: string | null; hasMore: boolean; total?: number }
export type DataEnvelope<T> = { data: T }
export type ListEnvelope<T> = { data: T[]; page: PageInfo }
export type PageParams = { limit?: number; cursor?: string }

export type JobCategory = 'dev' | 'data' | 'design' | 'planning' | 'marketing' | 'sales' | 'hr' | 'management'
export type CareerYears = '0' | '1-3' | '4-6' | '7-9' | '10+'
export type EmploymentType = 'full_time' | 'contract' | 'intern' | 'freelance' | 'dispatch'
export type CareerStatus = 'satisfied' | 'seeking' | 'feedback'
export type Tenure = '0-2' | '3-5' | '6-9' | '10+'
export type PostCategory = 'work' | 'dev' | 'daily' | 'career' | 'talk' | 'coffeechat' | 'marketing'
export type Tone = 'as_is' | 'professional' | 'confident' | 'concise' | 'technical' | 'friendly'

export type Posting = {
  id: string
  company: string
  title: string
  jobCategory: JobCategory
  imageUrl: string | null
  skills: string[]
  careerMin: number
  careerMax: number | null
  location: string
  employmentType: EmploymentType
  deadline: string | null
  bookmarked: boolean
  applied: boolean
  sourceUrl: string | null
  createdAt: string
}

export type PostingDetail = Posting & {
  description: string
  requirements: string[]
  workConditions: string[]
}

export type PostingFilters = PageParams & {
  q?: string
  category?: JobCategory[]
  skills?: string[]
  careerYears?: CareerYears[]
  location?: string[]
  employmentType?: EmploymentType[]
}

export type Career = { company: string; role: string; startedOn: string; endedOn: string | null; description: string }

export type Profile = {
  userId: string
  displayName: string
  avatarUrl: string | null
  headline: string
  jobCategory: JobCategory
  tenureYears: number
  careerStatus: CareerStatus
  openToOffers: boolean
  intro: string
  careers: Career[]
  skills: string[]
  followerCount: number
  resumeSourceId: string | null
  updatedAt: string
  following?: boolean
  offered?: boolean
}

export type ProfileFilters = PageParams & {
  q?: string
  category?: JobCategory[]
  tenure?: Tenure[]
  status?: CareerStatus[]
  explore?: 'recommended' | 'offers'
}

export type UserRef = { id: string; displayName: string; avatarUrl?: string | null }

export type OfferStatus = 'SENT' | 'READ' | 'ACCEPTED' | 'DECLINED'
export type Offer = {
  id: string
  sender: UserRef & { affiliation?: string }
  recipient: UserRef
  message: string
  posting: Posting | null
  status: OfferStatus
  readAt: string | null
  createdAt: string
}
export type OfferMessage = { id: string; offerId: string; sender: UserRef; body: string; createdAt: string }

export type Post = {
  id: string
  author: UserRef
  category: PostCategory
  title: string
  body: string
  imageUrls: string[]
  commentCount: number
  viewCount: number
  createdAt: string
}
export type Comment = { id: string; author: UserRef; body: string; parentId?: string | null; createdAt: string }

export type LinkKind = 'job' | 'github' | 'portfolio' | 'blog' | 'other'
export type UserLink = {
  id: string
  kind: LinkKind
  url: string
  title: string
  status: 'READING' | 'READ' | null
  fitCount: number
  aiRead: boolean
  createdAt: string
}

export type NotificationType = 'DEADLINE' | 'OFFER' | 'COMMENT' | 'AI_DONE'
export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  target: { kind: 'posting' | 'offer' | 'post' | 'conversation'; id: string }
  readAt: string | null
  createdAt: string
}

export type Settings = {
  notifyDeadline: boolean
  notifyOffer: boolean
  notifyComment: boolean
  notifyAiDone: boolean
  locale: 'ko' | 'en'
  profilePublic: boolean
  careerStatusVisibility: 'everyone' | 'followers' | 'private'
  hideFromCurrentCompany: boolean
  contactVisibility: 'everyone' | 'accepted'
  defaultTone: Tone
  chatRetentionDays: number
  allowAiReadMyFiles: boolean
}

// Existing APIs (implemented in push-be).
export type Source = { id: string; fileName: string; mimeType: string; size: number; sha256: string; status: string; createdAt?: string }

export type ApplicationStage =
  | 'DISCOVERED' | 'PREPARING' | 'READY' | 'APPLIED' | 'SCREENING'
  | 'INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
export type Application = {
  id: string
  revision: number
  jobId: string
  company: string
  title: string
  stage: ApplicationStage
  appliedAt: string | null
  createdAt: string
}

export type Conversation = {
  id: string
  revision: number
  applicationId: string | null
  title: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export type Message = {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT'
  text: string
  attachments: { type: string; id: string; documentId?: string; title?: string }[]
  operationId: string | null
  createdAt: string
}

export type AiOptions = {
  provider: 'OPENAI' | 'OPENROUTER' | 'CLAUDE' | 'GEMINI' | 'GROK'
  model: string
  credentialMode: 'MANAGED' | 'BYOK'
  effort: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAX'
}

export type StreamEvent =
  | { type: 'token'; text: string; seq?: number }
  | { type: 'status'; text: string; seq?: number }
  | { type: 'done'; operation: unknown; seq?: number }
  | { type: 'error'; error: { code: string; message: string; details?: unknown }; seq?: number }

export type Session = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: { id: string; displayName: string; locale: string }
}
