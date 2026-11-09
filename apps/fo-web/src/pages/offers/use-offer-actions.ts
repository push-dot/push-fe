import type { Offer } from '@push/api-client'
import { OFFER_MENU_COPY } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  meAcceptOffer,
  meArchiveOffer,
  meBlockUser,
  meDeclineOffer,
  meReportOffer,
  meSendOfferMessage,
  meUnarchiveOffer,
} from '../../features/respond-to-offer'
import type { useToast } from '../../shared/ui/toast'
import { OFFER_ACCEPTED, OFFER_DECLINED } from './constants'
import { offerMenu, offerToast, type OfferBox, type OfferMenuKey, type OfferToast } from './lib'

type Show = ReturnType<typeof useToast>['show']

const useOfferActions = (offer: Offer, box: OfferBox, listPath: string, show: Show) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['offers'] }),
      queryClient.invalidateQueries({ queryKey: ['offer', offer.id] }),
      queryClient.invalidateQueries({ queryKey: ['offer-messages', offer.id] }),
    ])
  const toast = ({ message, tone, action }: OfferToast) =>
    show(message, {
      tone: tone ?? 'ok',
      action: action && {
        label: action.label,
        onClick: () => {
          show(null)
          action.onClick()
        },
      },
    })
  const failed = () => {
    toast({ message: OFFER_MENU_COPY.failed, tone: 'err' })
    void refresh()
  }
  const responded = (message: string) => async () => {
    toast({ message })
    await refresh()
  }
  const accept = useMutation({ mutationFn: () => meAcceptOffer(offer.id), onSuccess: responded(OFFER_ACCEPTED), onError: failed })
  const decline = useMutation({ mutationFn: () => meDeclineOffer(offer.id), onSuccess: responded(OFFER_DECLINED), onError: failed })
  const send = useMutation({ mutationFn: (body: string) => meSendOfferMessage(offer.id, body), onSuccess: refresh, onError: failed })
  const menu = useMutation({
    mutationFn: (key: Exclude<OfferMenuKey, 'profile'>) =>
      offerMenu(offer, box, {
        archive: meArchiveOffer,
        unarchive: meUnarchiveOffer,
        report: meReportOffer,
        block: meBlockUser,
        refresh,
        back: () => navigate(listPath),
        toast: (t) => toast(offerToast(t)),
      })[key](),
  })
  return { accept, decline, send, menu }
}

export default useOfferActions
