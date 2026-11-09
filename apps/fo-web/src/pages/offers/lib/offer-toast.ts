import { OFFER_MENU_COPY, type OfferMenuToast } from '@push/shared'

export type OfferToast = { message: string; tone?: 'err'; action?: { label: string; onClick: () => void } }

export const offerToast = ({ kind, message, undo }: OfferMenuToast): OfferToast => ({
  message,
  ...(kind === 'failed' ? { tone: 'err' as const } : {}),
  ...(undo ? { action: { label: OFFER_MENU_COPY.undo, onClick: undo } } : {}),
})
