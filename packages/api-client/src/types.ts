export type PageInfo = { nextCursor: string | null; hasMore: boolean; total?: number }
export type DataEnvelope<T> = { data: T }
export type ListEnvelope<T> = { data: T[]; page: PageInfo }
export type PageParams = { limit?: number; cursor?: string }

/** GET /posts. push-be accepts sort=latest|popular and period=week (omitted means no window). */
export type PostsListParams = PageParams & {
  sort?: 'latest' | 'popular'
  period?: 'week'
}
export type SearchTrending = { terms: { term: string; count: number }[]; skills: { id: string; count: number }[] }

export type JobCategory = 'dev' | 'data' | 'design' | 'plan' | 'marketing' | 'sales' | 'hr' | 'ops'
export type CareerYears = '0' | '1-3' | '4-6' | '7-9' | '10+'
export type EmploymentType = 'full_time' | 'contract' | 'intern' | 'freelance' | 'dispatch'
export type CareerStatus = 'satisfied' | 'seeking' | 'feedback'
export type Tenure = '0-2' | '3-5' | '6-9' | '10+'
export type PostCategory = 'work' | 'dev' | 'daily' | 'career' | 'talk' | 'coffeechat' | 'marketing'
export type Tone = 'as_is' | 'professional' | 'confident' | 'concise' | 'technical' | 'friendly'

export type PostingStatus = 'DRAFT' | 'OPEN' | 'CLOSED'

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
  /** Present for company members; older servers omit it. */
  status?: PostingStatus
}

/** Member-only fields push-be adds to the company list and to create; get, update and close answer newApplicantCount 0 and createdBy null. */
export type CompanyPostingFields = {
  applicantCount?: number
  /** Applicants the company has not opened yet. */
  newApplicantCount?: number
  createdBy?: { displayName: string } | null
  draftSource?: 'AGENT' | 'MANUAL' | null
}

export type CompanyPosting = Posting & CompanyPostingFields

export type PostingDetail = Posting & CompanyPostingFields & {
  description: string
  requirements: string[]
  workConditions: Record<string, unknown>
  preferred?: string[]
}

export type PostingFilters = PageParams & {
  q?: string
  sort?: 'latest' | 'deadline' | 'popular'
  deadlineWithin?: '7'
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
  followingCount?: number
  postCount?: number
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
  explore?: 'recommended' | 'offers' | 'received'
}

export type UserRef = { id: string; displayName: string; avatarUrl?: string | null }
export type SocialAuthor = UserRef & { employer?: boolean; companyName?: string | null }

export type OfferStatus = 'SENT' | 'READ' | 'ACCEPTED' | 'DECLINED'
export type OfferPosting = Pick<Posting, 'id' | 'company' | 'title' | 'imageUrl'>
export type OfferParty = UserRef & {
  companyName: string | null
  headline: string
  avatarUrl: string | null
  kind?: 'PERSON' | 'COMPANY'
}
export type Offer = {
  id: string
  sender: OfferParty
  recipient: OfferParty
  message: string
  posting: OfferPosting | null
  status: OfferStatus
  readAt: string | null
  /** When the recipient accepted or declined; null while open. */
  respondedAt?: string | null
  /** POST me/offers/:id/messages would succeed: ACCEPTED and the other party has not blocked the caller. */
  canSend?: boolean
  archivedAt?: string | null
  createdAt: string
}
export type OfferMessage = { id: string; offerId: string; sender: UserRef; body: string; createdAt: string }
export type BlockedUser = { user: UserRef & { companyName?: string | null }; createdAt: string }

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

export type ResumeDocument = {
  id: string
  revision: number
  title: string
  kind: string
  status: string
  updatedAt: string
  applicationId: string | null
  latestVersionId: string | null
  finalizedVersionId: string | null
}

export type DocumentExport = {
  id: string
  documentId: string
  versionId: string
  format: 'PDF' | 'DOCX'
  status: 'READY_TO_RENDER' | 'SUCCEEDED' | 'FAILED'
}

export type DocumentExportResult = {
  sha256: string
  byteLength: number
  pageCount?: number | null
  status: 'SUCCEEDED' | 'FAILED'
  errorCode?: string | null
}
export type Source = { id: string; fileName: string; mimeType: string; size: number; sha256: string; status: string; createdAt?: string; kind?: string }
export type UploadedSource = Source & { jobId?: string }
export type SourceItem = Pick<Source, 'id' | 'fileName' | 'mimeType' | 'size'> & {
  pageCount: number | null
  createdAt: string | null
  origin: string
  kind?: string | null
  /** AI documents only: the application's company and posting title; null for uploads. */
  company?: string | null
  postingTitle?: string | null
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

/** GET /conversations list row. push-be gateway conversationJson adds these beside Conversation. */
export type ConversationStatus = 'NEEDS_APPROVAL' | 'RUNNING' | 'DONE'
export type ConversationListItem = Conversation & {
  status: ConversationStatus
  queuePosition: number | null
  lastLine: string | null
  lastMessagePreview: string
  createdBy: { displayName: string }
  postingId: string | null
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
export type ChatIntent =
  | 'posting'
  | 'review'
  | 'interview'
  | 'general'
  | 'match_posting'
  | 'fit'
  | 'gaps'
  | 'experience'
  | 'boost'
  | 'find_postings'
  | 'deadline_postings'
  | 'applications'
  | 'calendar'
  | 'hub_profile'
  | 'offer_reply'
  | 'coffee_chat'
  | 'career_post'
export type ToolTier = 'READ' | 'SAFE_WRITE' | 'RISKY_WRITE'
export type ToolRunState = 'run' | 'ok' | 'err' | 'wait'
export type StreamOption = { id: string; label: string; desc?: string; badge?: string; sub?: string }
/** push-be #224. `action` is only on row options and is not an answer id. */
export type ChoiceOption = StreamOption & { action?: 'change' }
export type ChoiceSection =
  | { id: string; kind: 'chips'; title?: string; multiple?: boolean; options: ChoiceOption[]; selected: string[] }
  | { id: string; kind: 'rows'; title?: string; options: ChoiceOption[] }
  | { id: string; kind: 'toggle'; title?: string; options: ChoiceOption[]; selected: string[] }
  | { id: string; kind: 'thumbnails'; title?: string; options: ChoiceOption[]; selected: string[] }
export type ChoiceSubmit = { label: string; zeroLabel?: string; optionLabels?: Record<string, string> }
export type StreamHunk = { line: number | null; sign: '+' | '-' | ''; text: string }
/** GET .../turns only: how a card was answered. */
export type CardResolution = { status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'; optionId: string | null; optionIds?: string[] }
export type FitParts = { techStack?: number; experienceLink?: number; careerLevel?: number; keyword?: number; domain?: number }
export type DoneSummary = { summary?: string; fitFrom?: number; fitTo?: number; bullets?: string[] }
export type ResultAction = { id: string; label: string; method?: string; path?: string }
export type ApprovalKind = 'TOOL_ACTION' | 'DOCUMENT_EDIT'

export type StreamEvent = (
  | { type: 'token'; text: string }
  | { type: 'status'; text: string }
  | { type: 'done'; operation: unknown; awaiting?: 'approval' | 'choice' }
  | { type: 'error'; error: { code: string; message: string; details?: unknown } }
  | { type: 'cancelled' }
  | {
      type: 'tool'
      name: string
      state: ToolRunState
      summary: string
      tier?: ToolTier
      result?: Record<string, unknown>
      target?: string
      resultLine?: string
      extra?: string[]
      warning?: string
    }
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
      hunks?: StreamHunk[]
      foot?: string
      resolution?: CardResolution
    }
  | {
      type: 'choice'
      id: string
      options: StreamOption[]
      kind?: string
      title?: string
      gate?: string
      recommended?: string
      auto?: boolean
      detail?: string
      multiple?: boolean
      note?: string
      documentId?: string
      resolution?: CardResolution
      /** Present → render these instead of the top-level options. */
      sections?: ChoiceSection[]
      submit?: ChoiceSubmit
    }
  | { type: 'think'; seconds: number; phase: string }
  | {
      type: 'plan'
      id: 'strategy' | 'feedback'
      title: string
      meta: string
      rows: { tag: string; label: string; note: string }[]
      /** strategy only. No leading "+ ". */
      keywords?: string[]
    }
  | { type: 'paper'; id: string; label: string; heading: string; lines: string[] }
  | { type: 'file'; name: string; mime: string; fileId: string; documentId: string | null; downloadUrl: string }
  | ({
      type: 'result'
      source: 'external'
      taskLine: string
      checklist: string[]
      documentId: string
      company?: string
      actions: ResultAction[]
      fileName: string
      pageLine: string
      savedLine?: string
      cardMeta?: string
    } & DoneSummary)
  | ({
      type: 'result'
      source: 'profile'
      taskLine: string
      checklist: string[]
      documentId: string
      company?: string
      actions: ResultAction[]
      name: string
      headline: string
      title: string
      subtitle: string
    } & DoneSummary)
  /** A later todo with the same `id` replaces the earlier list. */
  | { type: 'todo'; id?: string; items: { id: string; text: string; state: 'todo' | 'now' | 'done'; added?: boolean }[] }
  | { type: 'diff'; documentId: string; revisionId: string; hunks: StreamHunk[] }
  | {
      type: 'fit'
      score: number
      parts?: FitParts
      topGap?: string
      plan?: 'FREE' | 'PRO' | 'ULTRA'
      band?: string
      summary?: string
      keywords?: { label: string; ok: boolean }[]
      /** ULTRA only. */
      projected?: { score: number; label: string; bullets: string[] }
      from?: number
      delta?: string
      note?: string
    }
) & { seq?: number }

/** One chat job as GET .../turns returns it: stored stream frames minus status and done. */
export type ConversationTurn = {
  jobId: string
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | 'CANCELLED'
  createdAt: string
  userMessageId: string | null
  assistantMessageId: string | null
  answer: { approvalId: string; optionId: string | null; optionIds?: string[] } | null
  events: Exclude<StreamEvent, { type: 'status' } | { type: 'done' }>[]
}

export type ApprovalResolution = { id: string; status: 'APPROVED' | 'REJECTED'; optionId: string; optionIds?: string[]; jobId?: string }

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
export type InvitePreview = { companyName: string; inviterName: string; inviterRole: CompanyRole; email: string; expiresAt: string }
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
  /** False while push-be has payments closed (PAYMENTS_ENABLED off); missing on servers before push-be #246. */
  paymentsEnabled?: boolean
}

export type CompanyBillingStatus = Omit<BillingStatus, 'plan'> & {
  plan: 'BASIC' | 'PRO' | 'ULTRA' | null
  audience?: BillingAudience
}

export type PendingAuth = { pendingToken: string; expiresIn: number }
export type AuthResult = Session | PendingAuth
export type PhoneCodeSent = { cooldownSeconds: number; expiresAt: string }
export type PhoneVerifyResult = Session & { created: boolean; linked?: boolean; provider?: string }

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
  legalName?: string | null
  representativeName?: string | null
  industry?: string | null
  website?: string | null
  intro?: string | null
  logoKey?: string | null
  logoUrl?: string | null
}

export type UpdateCompanyInput = Partial<
  Record<'legalName' | 'representativeName' | 'industry' | 'website' | 'intro' | 'logoKey', string | null>
>

export type CompanyMember = { userId: string; email: string; displayName?: string; role: CompanyRole; joinedAt: string }

export type CompanyInvite = { id: string; email: string; expiresAt: string; invitedAt: string }

export type EmployerStage = 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED'

export type ApplicantDocumentKind = 'PROFILE' | 'PDF' | 'FILE'

export type ApplicantSummary = {
  applicationId: string
  applicant: { displayName: string; headline: string | null; jobCategory?: string | null; tenureYears?: number | null; avatarUrl?: string | null }
  stage: ApplicationStage
  appliedAt: string
  /** Distinct kinds in fixed order PROFILE, PDF, FILE. */
  documentKinds?: ApplicantDocumentKind[]
  documents?: { title: string; pages: number | null }[]
}

export type ApplicantFile = { id: string; fileName: string; mimeType: string; size: number; pageCount: number | null }

export type ApplicantDetail = {
  application: Application
  documents: { id: string; title: string; content: string }[]
  files?: ApplicantFile[]
  applicant?: {
    displayName: string
    email: string
    headline: string
    careers: Partial<Career>[]
    skills: string[]
    /** The applicant's user id when the hub profile is public, else null. */
    hubProfileId: string | null
  }
}

export type ApplicantCounts = { total: number; applied: number; screening: number; interview: number; offer: number; rejected: number }

export type ConsentTerms = {
  version: string | null
  age14At: string | null
  serviceTermsAt: string | null
  privacyAt: string | null
  marketing: boolean
  marketingAt: string | null
}
export type Consent = { referenceData: boolean; updatedAt: string | null; terms?: ConsentTerms }
export type SignupTermsInput = {
  age14: true
  serviceTerms: true
  privacy: true
  marketing: boolean
  termsVersion?: string
}

export type CreatePostingInput = {
  /** DRAFT keeps the posting off the public list; omitted means OPEN. */
  status?: 'DRAFT' | 'OPEN'
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
  id: string
  /** WRITE_OFF (push-be #253): credits forgiven when an AI job overran; never a payment, amountUsd null. */
  type: 'PURCHASE' | 'REFUND' | 'WRITE_OFF'
  amountMicroCredits: number
  balanceAfter: number
  referenceId: string | null
  createdAt: string
  /** Payment label ({Plan} 월 구독, 크레딧 구매, 크레딧 구매 환불, 요금제 변경 환급); null for credit grants. */
  description: string | null
  /** USD of a Stripe payment, negative for a refund; null when the row is not a Stripe payment. */
  amountUsd: number | null
  receiptUrl: string | null
}

export type EmailSignupInput = {
  email: string
  password: string
  accountType: AccountType
  displayName: string
  /** The 약관·개인정보처리방침 checkbox; push-be #240 requires true for every email signup. */
  agreeTerms?: boolean
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
  remindAt?: string | null
  location?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateCalendarEventInput = Pick<CalendarEvent, 'type' | 'title' | 'startsAt' | 'endsAt'> &
  Partial<Pick<CalendarEvent, 'timeZone' | 'notes' | 'remindAt' | 'location' | 'applicationId'>>

export type GoogleIntegration = {
  enabled: boolean
  connected: boolean
  scopes: string[]
  gmailStatus: 'CONNECTED' | 'DISCONNECTED' | 'DISABLED'
  calendarStatus: 'CONNECTED' | 'DISCONNECTED'
  lastSyncedAt: string | null
}

export type ConversationAttachment = { id: string }
