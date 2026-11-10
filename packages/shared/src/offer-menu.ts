// The offer ⋯ menu for 마이 › 받은 제안 (app) and /offers (web): which actions show and what each one does.
// Each app adapts OfferMenuToast to its own toast.

export const OFFER_MENU_COPY = {
  profile: '허브 프로필 보기',
  archive: '제안 보관하기',
  unarchive: '보관 풀기',
  report: '신고하기',
  block: '차단하기',
  archived: '제안을 보관했어요',
  undo: '되돌리기',
  reported: '신고가 접수됐어요',
  failed: '잠시 뒤에 다시 시도해 주세요.',
}
export const offerBlocked = (name: string) => `${name} 님을 차단했어요`
export const offerBlockConfirm = (name: string) => ({
  title: `${name} 님을 차단할까요?`,
  body: `${name} 님의 제안이 목록에서 사라지고, 앞으로 제안과 메시지를 받지 않아요. 상대에게는 차단했다고 알리지 않아요.`,
  note: '설정 › 차단한 사람에서 언제든 풀 수 있어요.',
  confirm: '차단',
})

export type OfferBox = 'received' | 'sent'
export type OfferMenuKey = 'profile' | 'archive' | 'unarchive' | 'report' | 'block'

type Party = { id: string; displayName: string }
export type MenuOffer = { id: string; sender: Party; recipient: Party; archivedAt?: string | null }

export type OfferMenuToast = { kind: 'archived' | 'reported' | 'blocked' | 'failed'; message: string; undo?: () => void }

export type OfferMenuDeps = {
  archive: (id: string) => Promise<unknown>
  unarchive: (id: string) => Promise<unknown>
  report: (id: string) => Promise<unknown>
  block: (userId: string) => Promise<unknown>
  refresh: () => Promise<unknown>
  back: () => void
  toast: (toast: OfferMenuToast) => void
}

export const viewerBox = (offer: MenuOffer, viewerId: string | undefined, hint: OfferBox): OfferBox => {
  if (viewerId === offer.sender.id) return 'sent'
  if (viewerId === offer.recipient.id) return 'received'
  return hint
}

export const otherParty = <O extends MenuOffer>(offer: O, box: OfferBox): O['sender'] => (box === 'sent' ? offer.recipient : offer.sender)

export const offerMenuKeys = (offer: MenuOffer, box: OfferBox): OfferMenuKey[][] => {
  const keep: OfferMenuKey[] = ['profile']
  if (offer.archivedAt) keep.push('unarchive')
  else if (box === 'received') keep.push('archive')
  return [keep, ['report', 'block']]
}

/** Every failure shows the error toast and re-reads the offer so the screen never shows a stale state. */
export const offerMenu = (offer: MenuOffer, box: OfferBox, d: OfferMenuDeps) => {
  const who = otherParty(offer, box)
  const failed = () => {
    d.toast({ kind: 'failed', message: OFFER_MENU_COPY.failed })
    void d.refresh()
  }
  const run = (task: Promise<unknown>, done: () => unknown) => task.then(done, failed)
  return {
    archive: () =>
      run(d.archive(offer.id), async () => {
        d.back()
        await d.refresh()
        d.toast({ kind: 'archived', message: OFFER_MENU_COPY.archived, undo: () => void d.unarchive(offer.id).then(d.refresh, failed) })
      }),
    unarchive: () => run(d.unarchive(offer.id), () => void d.refresh()),
    report: () => run(d.report(offer.id), () => d.toast({ kind: 'reported', message: OFFER_MENU_COPY.reported })),
    block: () =>
      run(d.block(who.id), async () => {
        d.back()
        await d.refresh()
        d.toast({ kind: 'blocked', message: offerBlocked(who.displayName) })
      }),
  }
}
