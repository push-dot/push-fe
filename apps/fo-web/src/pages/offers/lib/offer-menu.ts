import type { Offer } from '@push/api-client'

import { OFFER_MENU_COPY, offerBlocked } from '../constants'

export type OfferBox = 'received' | 'sent'

export type OfferToast = { message: string; tone?: 'err'; action?: { label: string; onClick: () => void } }

export type OfferMenuDeps = {
  archive: (id: string) => Promise<unknown>
  unarchive: (id: string) => Promise<unknown>
  report: (id: string) => Promise<unknown>
  block: (userId: string) => Promise<unknown>
  refresh: () => Promise<unknown>
  back: () => void
  toast: (toast: OfferToast) => void
}

export type OfferMenuKey = 'profile' | 'archive' | 'unarchive' | 'report' | 'block'

export const viewerBox = (offer: Offer, viewerId: string | undefined, hint: OfferBox): OfferBox => {
  if (viewerId === offer.sender.id) return 'sent'
  if (viewerId === offer.recipient.id) return 'received'
  return hint
}

export const otherParty = (offer: Offer, box: OfferBox) => (box === 'sent' ? offer.recipient : offer.sender)

export const offerMenuKeys = (offer: Offer, box: OfferBox): OfferMenuKey[][] => {
  const keep: OfferMenuKey[] = ['profile']
  if (offer.archivedAt) keep.push('unarchive')
  else if (box === 'received') keep.push('archive')
  return [keep, ['report', 'block']]
}

export const offerMenu = (offer: Offer, box: OfferBox, deps: OfferMenuDeps) => {
  const who = otherParty(offer, box)
  const failed = () => {
    deps.toast({ message: OFFER_MENU_COPY.failed, tone: 'err' })
    void deps.refresh()
  }
  const run = (task: Promise<unknown>, done: () => unknown) => task.then(done, failed)
  return {
    archive: () =>
      run(deps.archive(offer.id), async () => {
        deps.back()
        await deps.refresh()
        deps.toast({
          message: OFFER_MENU_COPY.archived,
          action: { label: OFFER_MENU_COPY.undo, onClick: () => void deps.unarchive(offer.id).then(deps.refresh, failed) },
        })
      }),
    unarchive: () => run(deps.unarchive(offer.id), () => void deps.refresh()),
    report: () => run(deps.report(offer.id), () => deps.toast({ message: OFFER_MENU_COPY.reported })),
    block: () =>
      run(deps.block(who.id), async () => {
        deps.back()
        await deps.refresh()
        deps.toast({ message: offerBlocked(who.displayName) })
      }),
  }
}
