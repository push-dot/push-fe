import type { Client } from './client'
import { readEvents } from './sse'
import { ApiError } from './errors'
import type {
  AccountType, AiOptions, AppNotification, ApplicantDetail, ApplicantSummary, Application, ApplicationStage, BillingStatus,
  CalendarEvent, Comment, Company, CompanyBillingStatus, CompanyMember, Consent, Conversation, ConversationAttachment, CreatePostingInput,
  DataEnvelope, EmailSignupInput, EmployerPlan, EmployerStage, LedgerEntry, LinkKind, ListEnvelope, Me, Message,
  Offer, OfferMessage, PageParams, Post, PostCategory, Posting, PostingDetail, PostingFilters, Profile,
  ProfileFilters, Session, Settings, Source, StreamEvent, Tone, UpdatePostingInput, UserLink, VerifyIapInput, VerifyIapResult,
  WebNotification,
} from './types'

const unwrap = async <T>(p: Promise<DataEnvelope<T>>) => (await p).data

export const createApi = (c: Client) => ({
  auth: {
    start: (provider: 'google' | 'github', query: { codeChallenge: string; redirectUri: string; accountType?: AccountType }) =>
      unwrap(c.get<DataEnvelope<{ authorizationUrl: string; state: string }>>(`auth/${provider}/start`, {
        query: { ...query, codeChallengeMethod: 'S256' },
      })),
    exchange: (body: { code: string; codeVerifier: string }) => unwrap(c.post<DataEnvelope<Session>>('auth/exchange', { body })),
    refresh: (refreshToken: string) => unwrap(c.post<DataEnvelope<Session>>('auth/refresh', { body: { refreshToken } })),
    logout: (refreshToken: string) => c.post<void>('auth/logout', { body: { refreshToken } }),
    me: () => unwrap(c.get<DataEnvelope<Me>>('auth/me')),
    emailSignup: async (body: EmailSignupInput) => {
      await c.raw('POST', 'auth/email/signup', { body })
    },
    emailVerify: (token: string) => unwrap(c.post<DataEnvelope<Session>>('auth/email/verify', { body: { token } })),
    emailLogin: (email: string, password: string) =>
      unwrap(c.post<DataEnvelope<Session>>('auth/email/login', { body: { email, password } })),
    requestPasswordReset: async (email: string) => {
      await c.raw('POST', 'auth/email/password-reset', { body: { email } })
    },
    confirmPasswordReset: (token: string, password: string) =>
      c.post<void>('auth/email/password-reset/confirm', { body: { token, password } }),
  },

  postings: {
    list: (f: PostingFilters = {}) => c.get<ListEnvelope<Posting>>('postings', { query: f }),
    mine: (p: PageParams = {}) => c.get<ListEnvelope<Posting>>('companies/me/postings', { query: p }),
    locations: (f: PostingFilters = {}) =>
      unwrap(c.get<DataEnvelope<{ location: string; count: number }[]>>('postings/locations', { query: f })),
    get: (id: string) => unwrap(c.get<DataEnvelope<PostingDetail>>(`postings/${id}`)),
    bookmark: (id: string) => c.post<void>(`postings/${id}/bookmark`),
    unbookmark: (id: string) => c.delete<void>(`postings/${id}/bookmark`),
    apply: (id: string, documentIds: string[]) =>
      unwrap(c.post<DataEnvelope<Application>>(`postings/${id}/apply`, { body: { documentIds } })),
    create: (body: CreatePostingInput) => unwrap(c.post<DataEnvelope<PostingDetail>>('postings', { body })),
    update: (id: string, body: UpdatePostingInput) => unwrap(c.patch<DataEnvelope<PostingDetail>>(`postings/${id}`, { body })),
    close: (id: string, expectedRevision: number) =>
      unwrap(c.post<DataEnvelope<PostingDetail>>(`postings/${id}/close`, { body: { expectedRevision } })),
    applicants: (id: string, query?: PageParams & { stage?: ApplicationStage }) =>
      c.get<ListEnvelope<ApplicantSummary>>(`postings/${id}/applicants`, { query }),
    applicant: (postingId: string, applicationId: string) =>
      unwrap(c.get<DataEnvelope<ApplicantDetail>>(`postings/${postingId}/applicants/${applicationId}`)),
    setApplicantStage: (postingId: string, applicationId: string, stage: EmployerStage) =>
      unwrap(c.patch<DataEnvelope<Application>>(`postings/${postingId}/applicants/${applicationId}`, { body: { stage } })),
  },

  search: <T extends 'postings' | 'people' | 'posts'>(q: string, type: T, page: PageParams = {}) =>
    c.get<ListEnvelope<T extends 'postings' ? Posting : T extends 'people' ? Profile : Post>>('search', {
      query: { q, type, ...page },
    }),

  profiles: {
    list: (f: ProfileFilters = {}) => c.get<ListEnvelope<Profile>>('profiles', { query: f }),
    get: (userId: string) => unwrap(c.get<DataEnvelope<Profile>>(`profiles/${userId}`)),
    offer: (userId: string, body: { message: string; postingId?: string }) =>
      unwrap(c.post<DataEnvelope<Offer>>(`profiles/${userId}/offer`, { body })),
    follow: (userId: string) => c.post<void>(`users/${userId}/follow`),
    unfollow: (userId: string) => c.delete<void>(`users/${userId}/follow`),
  },

  me: {
    /** Marks the account for deletion (30-day grace; logging in again restores it). */
    deleteAccount: () => c.delete<void>('me'),
    profile: () => unwrap(c.get<DataEnvelope<Profile>>('me/profile')),
    updateProfile: (patch: Partial<Profile> & { avatarKey?: string }) =>
      unwrap(c.patch<DataEnvelope<Profile>>('me/profile', { body: patch })),
    bookmarks: (p: PageParams = {}) => c.get<ListEnvelope<Posting>>('me/bookmarks', { query: p }),
    follows: (p: PageParams = {}) => c.get<ListEnvelope<Profile>>('me/follows', { query: p }),
    followers: (p: PageParams = {}) => c.get<ListEnvelope<Profile>>('me/followers', { query: p }),
    posts: (p: PageParams = {}) => c.get<ListEnvelope<Post>>('me/posts', { query: p }),
    commentedPosts: (p: PageParams = {}) => c.get<ListEnvelope<Post>>('me/commented-posts', { query: p }),
    offers: (box: 'received' | 'sent', p: PageParams = {}) =>
      c.get<ListEnvelope<Offer>>('me/offers', { query: { box, ...p } }),
    offer: (id: string) => unwrap(c.get<DataEnvelope<Offer>>(`me/offers/${id}`)),
    acceptOffer: (id: string, reply?: string) =>
      unwrap(c.post<DataEnvelope<Offer>>(`me/offers/${id}/accept`, { body: reply ? { reply } : {} })),
    declineOffer: (id: string) => unwrap(c.post<DataEnvelope<Offer>>(`me/offers/${id}/decline`)),
    offerMessages: (id: string, p: PageParams = {}) =>
      c.get<ListEnvelope<OfferMessage>>(`me/offers/${id}/messages`, { query: p }),
    sendOfferMessage: (id: string, body: string) =>
      unwrap(c.post<DataEnvelope<OfferMessage>>(`me/offers/${id}/messages`, { body: { body } })),
    links: (kind?: LinkKind, p: PageParams = {}) => c.get<ListEnvelope<UserLink>>('me/links', { query: { kind, ...p } }),
    addLink: (body: { url: string; kind?: LinkKind; title?: string; aiRead?: boolean }) =>
      unwrap(c.post<DataEnvelope<UserLink>>('me/links', { body })),
    deleteLink: (id: string) => c.delete<void>(`me/links/${id}`),
    notifications: (p: PageParams = {}) => c.get<ListEnvelope<AppNotification>>('me/notifications', { query: p }),
    webNotifications: (p: PageParams = {}) => c.get<ListEnvelope<WebNotification>>('me/notifications', { query: p }),
    readNotifications: (ids: string[] | 'all') =>
      c.post<void>('me/notifications/read', { body: ids === 'all' ? { all: true } : { ids } }),
    registerDevice: (token: string, platform: 'ios' | 'android') =>
      c.post<void>('me/devices', { body: { token, platform } }),
    unregisterDevice: (token: string) => c.delete<void>(`me/devices/${encodeURIComponent(token)}`),
    settings: () => unwrap(c.get<DataEnvelope<Settings>>('me/settings')),
    updateSettings: (patch: Partial<Settings> & { defaultTone?: Tone }) =>
      unwrap(c.patch<DataEnvelope<Settings>>('me/settings', { body: patch })),
    consents: () => unwrap(c.get<DataEnvelope<Consent>>('me/consents')),
    updateConsents: (referenceData: boolean) =>
      unwrap(c.put<DataEnvelope<Consent>>('me/consents', { body: { referenceData } })),
  },

  posts: {
    list: (category?: PostCategory | null, p: PageParams = {}) =>
      c.get<ListEnvelope<Post>>('posts', { query: { category: category ?? undefined, ...p } }),
    get: (id: string) => unwrap(c.get<DataEnvelope<Post>>(`posts/${id}`)),
    create: (body: { category: PostCategory; title: string; body: string; imageKeys: string[] }) =>
      unwrap(c.post<DataEnvelope<Post>>('posts', { body })),
    comments: (id: string, p: PageParams = {}) => c.get<ListEnvelope<Comment>>(`posts/${id}/comments`, { query: p }),
    comment: (id: string, body: string, parentId?: string) =>
      unwrap(c.post<DataEnvelope<Comment>>(`posts/${id}/comments`, { body: { body, parentId } })),
  },

  uploads: {
    image: (form: FormData) => unwrap(c.post<DataEnvelope<{ key: string; url: string }>>('uploads/images', { form })),
  },

  billing: {
    status: () => unwrap(c.get<DataEnvelope<BillingStatus>>('billing')),
    companyStatus: () => unwrap(c.get<DataEnvelope<CompanyBillingStatus>>('billing')),
    checkout: (planId: EmployerPlan) => unwrap(c.post<DataEnvelope<{ url: string }>>('billing/checkout', { body: { planId } })),
    topup: (amount: number) => unwrap(c.post<DataEnvelope<{ url: string }>>('billing/topup', { body: { amount } })),
    portal: () => unwrap(c.post<DataEnvelope<{ url: string }>>('billing/portal')),
    ledger: (page?: PageParams) => c.get<ListEnvelope<LedgerEntry>>('billing/ledger', { query: page }),
    verifyIap: (body: VerifyIapInput) => unwrap(c.post<DataEnvelope<VerifyIapResult>>('billing/iap/verify', { body })),
  },

  // Existing push-be APIs.
  sources: {
    /** push-be requires a `kind` form field next to `file`; it is stored as-is. */
    upload: (form: FormData) => unwrap(c.post<DataEnvelope<Source>>('sources', { form })),
    get: (id: string) => unwrap(c.get<DataEnvelope<Source>>(`sources/${id}`)),
    remove: (id: string) => c.delete<void>(`sources/${id}`),
  },
  applications: {
    list: (p: PageParams & { stage?: string; query?: string } = {}) =>
      c.get<ListEnvelope<Application>>('applications', { query: p }),
  },
  conversations: {
    list: (p: PageParams & { audience?: 'EMPLOYER' | 'PERSONAL' } = {}) =>
      c.get<ListEnvelope<Conversation>>('conversations', { query: p }),
    create: (title: string) => unwrap(c.post<DataEnvelope<Conversation>>('conversations', { body: { title } })),
    createEmployer: (body: { title: string; postingId?: string; applicationId?: string }) =>
      unwrap(c.post<DataEnvelope<Conversation>>('conversations', { body: { ...body, audience: 'EMPLOYER' } })),
    attach: (id: string, form: FormData) =>
      unwrap(c.post<DataEnvelope<ConversationAttachment>>(`conversations/${id}/attachments`, { form })),
    rename: (id: string, expectedRevision: number, title: string) =>
      unwrap(c.patch<DataEnvelope<Conversation>>(`conversations/${id}`, { body: { expectedRevision, title } })),
    archive: (id: string, expectedRevision: number) =>
      unwrap(c.post<DataEnvelope<Conversation>>(`conversations/${id}/archive`, { body: { expectedRevision } })),
    messages: (id: string, p: PageParams = {}) =>
      c.get<ListEnvelope<Message>>(`conversations/${id}/messages`, { query: p }),
    send: async (
      id: string,
      body: {
        text: string
        accessMode: 'SUGGEST' | 'CONFIRM_ACTIONS'
        intent?: 'posting' | 'review' | 'interview' | 'general'
        applicationId?: string
      },
    ) => {
      await c.raw('POST', `conversations/${id}/messages`, { body })
    },
    /** Streams a reply. Pass expo/fetch's fetch on React Native so `body` is a ReadableStream. */
    stream: async function* (
      id: string,
      body: { text: string; accessMode: 'SUGGEST' | 'CONFIRM_ACTIONS'; ai?: AiOptions; context?: { documentId?: string; evidenceIds?: string[] } },
      signal?: AbortSignal,
    ): AsyncGenerator<StreamEvent> {
      const res = await c.raw('POST', `conversations/${id}/messages/stream`, {
        body,
        signal,
        headers: { Accept: 'text/event-stream' },
      })
      if (!res.body) throw new ApiError('empty stream', 'NETWORK_ERROR', 0)
      yield* readEvents<StreamEvent>(res.body, signal)
    },
    active: async function* (id: string, after?: number, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
      const res = await c.raw('GET', `conversations/${id}/messages/stream/active`, {
        query: { after },
        signal,
        headers: { Accept: 'text/event-stream' },
      })
      if (res.status === 204 || !res.body) return
      yield* readEvents<StreamEvent>(res.body, signal)
    },
  },

  companies: {
    verify: (body: { bNo: string; startDt: string; pNm: string; bNm: string }) =>
      unwrap(c.post<DataEnvelope<Company>>('companies/verify', { body })),
    me: () => unwrap(c.get<DataEnvelope<Company>>('companies/me')),
    members: () => unwrap(c.get<DataEnvelope<CompanyMember[]>>('companies/me/members')),
    invite: (email: string) => c.post<void>('companies/me/invites', { body: { email } }),
    acceptInvite: (token: string) => c.post<void>(`companies/invites/${token}/accept`),
    removeMember: (userId: string) => c.delete<void>(`companies/me/members/${userId}`),
    transferAdmin: (userId: string) =>
      c.patch<void>(`companies/me/members/${userId}`, { body: { role: 'ADMIN' } }),
  },

  calendar: {
    events: (from: string, to: string) => c.get<ListEnvelope<CalendarEvent>>('calendar/events', { query: { from, to } }),
  },
})

export type Api = ReturnType<typeof createApi>
