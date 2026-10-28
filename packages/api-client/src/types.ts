export type PageInfo = { nextCursor: string | null; hasMore: boolean; total?: number }
export type DataEnvelope<T> = { data: T }
export type ListEnvelope<T> = { data: T[]; page: PageInfo }
export type PageParams = { limit?: number; cursor?: string }

export type JobCategory = 'dev' | 'data' | 'design' | 'plan' | 'marketing' | 'sales' | 'hr' | 'ops'
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
  revision?: number
  closedAt?: string | null
}

export type PostingDetail = Posting & {
  description: string
  requirements: string[]
  workConditions: Record<string, unknown>
  preferred?: string[]
}

export type PostingFilters = PageParams & {
  q?: string
  sort?: 'latest' | 'deadline' | 'popular'
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
  jobCategory: JobCategory | null
  tenureYears: number | null
  careerStatus: CareerStatus | null
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
export type SocialAuthor = UserRef & { employer?: boolean; companyName?: string | null }

export type OfferStatus = 'SENT' | 'READ' | 'ACCEPTED' | 'DECLINED'
export type OfferPosting = Pick<Posting, 'id' | 'company' | 'title' | 'imageUrl'>
export type Offer = {
  id: string
  sender: UserRef & { companyName: string | null; headline: string; avatarUrl: string | null }
  recipient: UserRef
  message: string
  posting: OfferPosting | null
  status: OfferStatus
  readAt: string | null
  createdAt: string
}
export type OfferMessage = { id: string; offerId: string; sender: UserRef; body: string; createdAt: string }

export type Post = {
  id: string
  author: SocialAuthor
  category: PostCategory
  title: string
  body: string
  imageUrls: string[]
  commentCount: number
  viewCount: number
  createdAt: string
}
export type Comment = { id: string; author: SocialAuthor; body: string; parentId?: string | null; createdAt: string }

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

export type NotificationType = 'DEADLINE' | 'OFFER' | 'COMMENT' | 'AI_DONE' | 'APPLICATION_STAGE'
export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  target: { kind: 'posting' | 'offer' | 'post' | 'conversation' | 'calendar' | 'activity'; id: string }
  readAt: string | null
  createdAt: string
}

export type WebNotificationType = NotificationType
export type WebNotification = AppNotification

export type Settings = {
  notifyDeadline: boolean
  notifyOffer: boolean
  notifyComment: boolean
  notifyAiDone: boolean
  notifyApplicationStage?: boolean
  locale: 'ko' | 'en'
  profilePublic: boolean
  careerStatusVisibility: 'everyone' | 'followers' | 'private'
  hideFromCurrentCompany: boolean
  contactVisibility: 'everyone' | 'followers' | 'accepted' | 'private'
  defaultTone: Tone
  chatRetentionDays: number | null
  allowAiReadMyFiles: boolean
  aiAccessMode: AccessMode
  defaultEffort: AiOptions['effort']
  confirmBeforeEdit: boolean
}

export type Source = { id: string; fileName: string; mimeType: string; size: number; sha256: string; status: string; createdAt?: string }
export type UploadedSource = Source & { jobId?: string }
export type SourceItem = Pick<Source, 'id' | 'fileName' | 'mimeType' | 'size'> & {
  pageCount: number | null
  createdAt: string | null
  origin: string
}
export type ProfileDraft = {
  displayName: string
  headline: string
  tenureYears: number | null
  intro: string
  careers: { company: string; title: string; start: string; end: string }[]
  skills: string[]
}

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
  fitScore?: number | null
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
  effort: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAX'
}

export type AccessMode = 'ALWAYS_ASK' | 'AUTO' | 'BYPASS'
export type ChatIntent = 'posting' | 'review' | 'interview' | 'general'
export type ToolTier = 'READ' | 'SAFE_WRITE' | 'RISKY_WRITE'
export type ToolRunState = 'run' | 'ok' | 'err' | 'wait'
export type StreamOption = { id: string; label: string }
export type ApprovalKind = 'TOOL_ACTION' | 'DOCUMENT_EDIT'

export type StreamEvent = (
  | { type: 'token'; text: string }
  | { type: 'status'; text: string }
  | { type: 'done'; operation: unknown; awaiting?: 'approval' | 'choice' }
  | { type: 'error'; error: { code: string; message: string; details?: unknown } }
  | { type: 'cancelled' }
  | { type: 'tool'; name: string; state: ToolRunState; summary: string; tier?: ToolTier; result?: Record<string, unknown> }
  | {
      type: 'approval'
      id: string
      kind: ApprovalKind
      title: string
      options: StreamOption[]
      summary?: string
      toolName?: string
      args?: Record<string, unknown>
      documentId?: string
    }
  | { type: 'choice'; id: string; options: StreamOption[]; kind?: string; title?: string; gate?: string; recommended?: string; auto?: boolean }
  | { type: 'file'; name: string; mime: string; fileId: string; documentId: string | null; downloadUrl: string }
  | { type: 'todo'; items: { id: string; text: string; state: 'todo' | 'now' | 'done' }[] }
  | { type: 'diff'; documentId: string; revisionId: string; hunks: { line: number | null; sign: '+' | '-' | ''; text: string }[] }
  | { type: 'fit'; score: number; parts: { techStack: number; experienceLink: number; keyword: number }; topGap: string }
) & { seq?: number }

export type ApprovalResolution = { id: string; status: 'APPROVED' | 'REJECTED'; optionId: string; jobId?: string }

export type QueueJobStatus = 'QUEUED' | 'RUNNING' | 'RETRY' | 'DONE' | 'FAILED' | 'DEAD' | 'CANCELLED'
export type QueueJob<R = unknown> = {
  id: string
  type: string
  status: QueueJobStatus
  progress: unknown
  result: R | null
  error: { code?: string; message?: string; details?: unknown } | null
  createdAt: string
  updatedAt: string
}
export type JobAccepted = { jobId: string }
export type GenerateDocumentInput = { expectedRevision: number; evidenceIds?: string[] }

export type AccountType = 'PERSONAL' | 'EMPLOYER'
export type CompanyRole = 'ADMIN' | 'MEMBER'
export type EmployerPlan = 'BASIC' | 'PRO' | 'ULTRA'
export type BillingAudience = 'PERSONAL' | 'EMPLOYER'
export type BillingSource = 'STRIPE' | 'APP_STORE' | 'GOOGLE_PLAY'

export type BillingStatus = {
  subscriptionStatus: string
  plan: 'FREE' | 'PRO' | 'ULTRA' | null
  periodEndsAt: string | null
  balanceMicroCredits: number
  reservedMicroCredits: number
  monthlyMicroCredits: number
  spentMicroCredits: number
  audience?: BillingAudience
  source?: BillingSource
}

export type CompanyBillingStatus = Omit<BillingStatus, 'plan'> & {
  plan: 'BASIC' | 'PRO' | 'ULTRA' | null
  audience?: BillingAudience
}

export type Session = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    displayName: string
    locale: string
    accountType?: AccountType
    companyId?: string | null
    companyRole?: CompanyRole | null
  }
}

export type Me = {
  id: string
  displayName: string
  locale: string
  createdAt: string
  accountType: AccountType
  companyId: string | null
  companyRole: CompanyRole | null
  email: string
  provider: string
}

export type Company = {
  id: string
  bNo: string
  name: string
  plan: EmployerPlan | null
  verifiedAt: string
  role: CompanyRole
  seats: { used: number; limit: number }
}

export type CompanyMember = { userId: string; email: string; role: CompanyRole; joinedAt: string }

export type EmployerStage = 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED'

export type ApplicantSummary = {
  applicationId: string
  applicant: { displayName: string; headline: string | null }
  stage: ApplicationStage
  appliedAt: string
}

export type ApplicantDetail = {
  application: Application
  documents: { id: string; title: string; content: string }[]
}

export type Consent = { referenceData: boolean; updatedAt: string | null }

export type CreatePostingInput = {
  title: string
  jobCategory: JobCategory
  careerMin: number
  careerMax?: number | null
  location: string
  employmentType: EmploymentType
  description: string
  skills?: string[]
  imageKey?: string
  deadline?: string | null
  requirements?: string[]
  preferred?: string[]
  workConditions?: Record<string, unknown>
}

export type UpdatePostingInput = Partial<CreatePostingInput> & { expectedRevision: number }

export type LedgerEntry = {
  type: 'PURCHASE' | 'REFUND'
  amountMicroCredits: number
  balanceAfter: number
  createdAt: string
}

export type EmailSignupInput = {
  email: string
  password: string
  accountType: AccountType
  displayName: string
  consentReference?: boolean
}

export type VerifyIapInput = {
  platform: 'APP_STORE' | 'GOOGLE_PLAY'
  productId: string
  signedTransaction?: string
  purchaseToken?: string
}

export type VerifyIapResult = {
  plan: BillingStatus['plan']
  periodEndsAt: string | null
}

export type CalendarEvent = {
  id: string
  revision: number
  applicationId: string | null
  type: 'INTERVIEW' | 'DEADLINE' | 'FOLLOW_UP' | 'CUSTOM' | 'COFFEE_CHAT'
  title: string
  startsAt: string
  endsAt: string
  timeZone: string
  source: 'LOCAL' | 'GOOGLE'
  externalId: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export type ConversationAttachment = { id: string }
