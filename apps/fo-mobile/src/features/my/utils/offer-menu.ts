import type { Offer } from '@push/api-client'
import type { ConfirmRequest } from '@/shared/components/confirm-store'
import type { MenuSection } from '@/shared/components/menu-action'
import { toastOffsets, type ToastInput } from '@/shared/components/toast-store'
import { OFFER_MENU_COPY, offerBlockConfirm, offerBlocked } from './my-rules'

export const otherParty = (o: Offer, viewerId: string) => (o.sender.id === viewerId ? o.recipient : o.sender)

export type OfferMenuDeps = {
  archive: (id: string) => Promise<unknown>
  unarchive: (id: string) => Promise<unknown>
  report: (id: string) => Promise<unknown>
  block: (userId: string) => Promise<unknown>
  refresh: () => Promise<unknown>
  back: () => void
  toast: (t: ToastInput) => void
}

/** The offer ⋯ menu actions; every failure shows the error toast and re-reads the offer so the screen never shows a stale state. */
export const offerMenu = (offer: Offer, viewerId: string, d: OfferMenuDeps) => {
  const failed = () => {
    d.toast({ message: OFFER_MENU_COPY.failed, tone: 'error' })
    void d.refresh()
  }
  const run = (task: Promise<unknown>, done: () => void) => task.then(done, failed)
  return {
    archive: () =>
      run(d.archive(offer.id), () => {
        d.back()
        void d.refresh()
        d.toast({
          message: OFFER_MENU_COPY.archived,
          action: { label: OFFER_MENU_COPY.undo, onPress: () => void d.unarchive(offer.id).then(d.refresh, failed) },
        })
      }),
    unarchive: () => run(d.unarchive(offer.id), () => void d.refresh()),
    report: () =>
      run(d.report(offer.id), () => d.toast({ message: OFFER_MENU_COPY.reported, bottom: toastOffsets(0).cta })),
    block: () =>
      run(d.block(otherParty(offer, viewerId).id), () => {
        d.back()
        void d.refresh()
        d.toast({ message: offerBlocked(otherParty(offer, viewerId).displayName) })
      }),
  }
}

export type OfferMenuSectionDeps = OfferMenuDeps & {
  profile: (userId: string) => void
  confirm: (r: ConfirmRequest) => void
}

/**
 * The ⋯ menu: 허브 프로필 보기 and 보관 (or 보관 풀기 once archived), then 신고하기 and 차단하기.
 * The box says which side the viewer is on. Only a received offer is archived (the 보관한 제안 list is the received box); an already archived one can always be released.
 */
export const offerMenuSections = (
  offer: Offer,
  box: 'received' | 'sent',
  d: OfferMenuSectionDeps,
): MenuSection[] => {
  const viewerId = box === 'received' ? offer.recipient.id : offer.sender.id
  const run = offerMenu(offer, viewerId, d)
  const who = otherParty(offer, viewerId)
  const archived = !!offer.archivedAt
  const keep: MenuSection['actions'] = [
    { key: 'profile', label: OFFER_MENU_COPY.profile, systemImage: 'person', icon: 'user', onPress: () => d.profile(who.id) },
  ]
  if (archived)
    keep.push({ key: 'unarchive', label: OFFER_MENU_COPY.unarchive, systemImage: 'tray.and.arrow.up', icon: 'archive', onPress: () => void run.unarchive() })
  else if (box === 'received')
    keep.push({ key: 'archive', label: OFFER_MENU_COPY.archive, systemImage: 'archivebox', icon: 'archive', onPress: () => void run.archive() })
  const harm: MenuSection['actions'] = [
    { key: 'report', label: OFFER_MENU_COPY.report, systemImage: 'flag', icon: 'flag', onPress: () => void run.report() },
    {
      key: 'block',
      label: OFFER_MENU_COPY.block,
      systemImage: 'nosign',
      icon: 'block',
      destructive: true,
      onPress: () => d.confirm({ ...offerBlockConfirm(who.displayName), danger: true, onConfirm: () => void run.block() }),
    },
  ]
  return [
    { key: 'keep', actions: keep },
    { key: 'harm', actions: harm },
  ]
}
