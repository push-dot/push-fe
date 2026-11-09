import { atDocumentRevision, type Api } from '@push/api-client'
import { api } from './client'

export const searchCatalog = (...args: Parameters<Api['search']>) => api.search(...args)

export const applicationsList = (...args: Parameters<Api['applications']['list']>) => api.applications.list(...args)

export const authConfirmPasswordReset = (...args: Parameters<Api['auth']['confirmPasswordReset']>) => api.auth.confirmPasswordReset(...args)

export const authEmailLogin = (...args: Parameters<Api['auth']['emailLogin']>) => api.auth.emailLogin(...args)

export const authEmailSignup = (...args: Parameters<Api['auth']['emailSignup']>) => api.auth.emailSignup(...args)

export const authEmailVerify = (...args: Parameters<Api['auth']['emailVerify']>) => api.auth.emailVerify(...args)

export const authExchange = (...args: Parameters<Api['auth']['exchange']>) => api.auth.exchange(...args)

export const authMe = (...args: Parameters<Api['auth']['me']>) => api.auth.me(...args)

export const authRequestPasswordReset = (...args: Parameters<Api['auth']['requestPasswordReset']>) => api.auth.requestPasswordReset(...args)

export const authStart = (...args: Parameters<Api['auth']['start']>) => api.auth.start(...args)

export const billingCheckout = (...args: Parameters<Api['billing']['checkout']>) => api.billing.checkout(...args)

export const billingCompanyStatus = (...args: Parameters<Api['billing']['companyStatus']>) => api.billing.companyStatus(...args)

export const billingTopup = (...args: Parameters<Api['billing']['topup']>) => api.billing.topup(...args)

export const billingLedger = (...args: Parameters<Api['billing']['ledger']>) => api.billing.ledger(...args)

export const calendarEvents = (...args: Parameters<Api['calendar']['events']>) => api.calendar.events(...args)

export const calendarCreate = (...args: Parameters<Api['calendar']['create']>) => api.calendar.create(...args)

export const integrationsGoogle = (...args: Parameters<Api['integrations']['google']>) => api.integrations.google(...args)

export const companiesAcceptInvite = (...args: Parameters<Api['companies']['acceptInvite']>) => api.companies.acceptInvite(...args)

export const companiesInvite = (...args: Parameters<Api['companies']['invite']>) => api.companies.invite(...args)

export const companiesInvites = (...args: Parameters<Api['companies']['invites']>) => api.companies.invites(...args)

export const companiesResendInvite = (...args: Parameters<Api['companies']['resendInvite']>) => api.companies.resendInvite(...args)

export const companiesCancelInvite = (...args: Parameters<Api['companies']['cancelInvite']>) => api.companies.cancelInvite(...args)

export const companiesUpdate = (...args: Parameters<Api['companies']['update']>) => api.companies.update(...args)

export const companiesMe = (...args: Parameters<Api['companies']['me']>) => api.companies.me(...args)

export const companiesMembers = (...args: Parameters<Api['companies']['members']>) => api.companies.members(...args)

export const companiesRemoveMember = (...args: Parameters<Api['companies']['removeMember']>) => api.companies.removeMember(...args)

export const companiesTransferAdmin = (...args: Parameters<Api['companies']['transferAdmin']>) => api.companies.transferAdmin(...args)

export const companiesVerify = (...args: Parameters<Api['companies']['verify']>) => api.companies.verify(...args)

export const conversationsAttach = (...args: Parameters<Api['conversations']['attach']>) => api.conversations.attach(...args)

export const conversationsCreateEmployer = (...args: Parameters<Api['conversations']['createEmployer']>) => api.conversations.createEmployer(...args)

export const conversationsList = (...args: Parameters<Api['conversations']['list']>) => api.conversations.list(...args)

export const conversationsMessages = (...args: Parameters<Api['conversations']['messages']>) => api.conversations.messages(...args)

export const conversationsSend = (...args: Parameters<Api['conversations']['send']>) => api.conversations.send(...args)

export const conversationsStream = (...args: Parameters<Api['conversations']['stream']>) => api.conversations.stream(...args)

export const conversationsFollow = (...args: Parameters<Api['conversations']['follow']>) => api.conversations.follow(...args)

export const conversationsResolveApproval = (...args: Parameters<Api['conversations']['resolveApproval']>) =>
  api.conversations.resolveApproval(...args)

export const meAcceptOffer = (...args: Parameters<Api['me']['acceptOffer']>) => api.me.acceptOffer(...args)

export const meAddLink = (...args: Parameters<Api['me']['addLink']>) => api.me.addLink(...args)

export const meArchiveOffer = (...args: Parameters<Api['me']['archiveOffer']>) => api.me.archiveOffer(...args)

export const meBlockUser = (...args: Parameters<Api['me']['blockUser']>) => api.me.blockUser(...args)

export const meBookmarks = (...args: Parameters<Api['me']['bookmarks']>) => api.me.bookmarks(...args)

export const meBlocks = (...args: Parameters<Api['me']['blocks']>) => api.me.blocks(...args)

export const meCommentedPosts = (...args: Parameters<Api['me']['commentedPosts']>) => api.me.commentedPosts(...args)

export const meConsents = (...args: Parameters<Api['me']['consents']>) => api.me.consents(...args)

export const meDeclineOffer = (...args: Parameters<Api['me']['declineOffer']>) => api.me.declineOffer(...args)

export const meDeleteAccount = (...args: Parameters<Api['me']['deleteAccount']>) => api.me.deleteAccount(...args)

export const meFollows = (...args: Parameters<Api['me']['follows']>) => api.me.follows(...args)

export const meLinks = (...args: Parameters<Api['me']['links']>) => api.me.links(...args)

export const meOffer = (...args: Parameters<Api['me']['offer']>) => api.me.offer(...args)

export const meOfferMessages = (...args: Parameters<Api['me']['offerMessages']>) => api.me.offerMessages(...args)

export const meOffers = (...args: Parameters<Api['me']['offers']>) => api.me.offers(...args)

export const mePosts = (...args: Parameters<Api['me']['posts']>) => api.me.posts(...args)

export const meProfile = (...args: Parameters<Api['me']['profile']>) => api.me.profile(...args)

export const meReadNotifications = (...args: Parameters<Api['me']['readNotifications']>) => api.me.readNotifications(...args)

export const meReportOffer = (...args: Parameters<Api['me']['reportOffer']>) => api.me.reportOffer(...args)

export const meSendOfferMessage = (...args: Parameters<Api['me']['sendOfferMessage']>) => api.me.sendOfferMessage(...args)

export const meSettings = (...args: Parameters<Api['me']['settings']>) => api.me.settings(...args)

export const meUnarchiveOffer = (...args: Parameters<Api['me']['unarchiveOffer']>) => api.me.unarchiveOffer(...args)

export const meUpdateConsents = (...args: Parameters<Api['me']['updateConsents']>) => api.me.updateConsents(...args)

export const meUpdateProfile = (...args: Parameters<Api['me']['updateProfile']>) => api.me.updateProfile(...args)

export const meUpdateSettings = (...args: Parameters<Api['me']['updateSettings']>) => api.me.updateSettings(...args)

export const meUnblockUser = (...args: Parameters<Api['me']['unblockUser']>) => api.me.unblockUser(...args)

export const meWebNotifications = (...args: Parameters<Api['me']['webNotifications']>) => api.me.webNotifications(...args)

export const postingsApplicant = (...args: Parameters<Api['postings']['applicant']>) => api.postings.applicant(...args)

export const postingsApplicantFile = (...args: Parameters<Api['postings']['applicantFile']>) => api.postings.applicantFile(...args)

export const postingsApplicantCounts = (...args: Parameters<Api['postings']['applicantCounts']>) => api.postings.applicantCounts(...args)

export const postingsApplicants = (...args: Parameters<Api['postings']['applicants']>) => api.postings.applicants(...args)

export const postingsApply = (...args: Parameters<Api['postings']['apply']>) => api.postings.apply(...args)

export const postingsBookmark = (...args: Parameters<Api['postings']['bookmark']>) => api.postings.bookmark(...args)

export const postingsClose = (...args: Parameters<Api['postings']['close']>) => api.postings.close(...args)

export const postingsCreate = (...args: Parameters<Api['postings']['create']>) => api.postings.create(...args)

export const postingsGet = (...args: Parameters<Api['postings']['get']>) => api.postings.get(...args)

export const postingsList = (...args: Parameters<Api['postings']['list']>) => api.postings.list(...args)

export const postingsLocations = (...args: Parameters<Api['postings']['locations']>) => api.postings.locations(...args)

export const postingsMine = (...args: Parameters<Api['postings']['mine']>) => api.postings.mine(...args)

export const postingsSetApplicantStage = (...args: Parameters<Api['postings']['setApplicantStage']>) => api.postings.setApplicantStage(...args)

export const postingsUnbookmark = (...args: Parameters<Api['postings']['unbookmark']>) => api.postings.unbookmark(...args)

export const postingsUpdate = (...args: Parameters<Api['postings']['update']>) => api.postings.update(...args)

export const postsComment = (...args: Parameters<Api['posts']['comment']>) => api.posts.comment(...args)

export const postsComments = (...args: Parameters<Api['posts']['comments']>) => api.posts.comments(...args)

export const postsCreate = (...args: Parameters<Api['posts']['create']>) => api.posts.create(...args)

export const postsGet = (...args: Parameters<Api['posts']['get']>) => api.posts.get(...args)

export const postsList = (...args: Parameters<Api['posts']['list']>) => api.posts.list(...args)

export const profilesFollow = (...args: Parameters<Api['profiles']['follow']>) => api.profiles.follow(...args)

export const profilesGet = (...args: Parameters<Api['profiles']['get']>) => api.profiles.get(...args)

export const profilesList = (...args: Parameters<Api['profiles']['list']>) => api.profiles.list(...args)

export const profilesOffer = (...args: Parameters<Api['profiles']['offer']>) => api.profiles.offer(...args)

export const profilesUnfollow = (...args: Parameters<Api['profiles']['unfollow']>) => api.profiles.unfollow(...args)

export const sourcesGet = (...args: Parameters<Api['sources']['get']>) => api.sources.get(...args)

export const sourcesList = (...args: Parameters<Api['sources']['list']>) => api.sources.list(...args)

export const sourcesUpload = (...args: Parameters<Api['sources']['upload']>) => api.sources.upload(...args)

export const sourcesRemove = (...args: Parameters<Api['sources']['remove']>) => api.sources.remove(...args)

export const sourcesContent = (...args: Parameters<Api['sources']['content']>) => api.sources.content(...args)

export const documentsGet = (...args: Parameters<Api['documents']['get']>) => api.documents.get(...args)

export const documentsExportFile = (...args: Parameters<Api['documents']['exportFile']>) => api.documents.exportFile(...args)

export const documentsRename = (id: string, title: string) =>
  atDocumentRevision(api.documents, id, (revision) => api.documents.rename(id, revision, title))

export const documentsArchive = (id: string) =>
  atDocumentRevision(api.documents, id, (revision) => api.documents.archive(id, revision))

export const meDeleteLink = (...args: Parameters<Api['me']['deleteLink']>) => api.me.deleteLink(...args)

export const meRestoreLink = (...args: Parameters<Api['me']['restoreLink']>) => api.me.restoreLink(...args)

export const uploadsImage = (...args: Parameters<Api['uploads']['image']>) => api.uploads.image(...args)
