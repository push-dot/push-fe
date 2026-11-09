import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import type { OfferGap } from '../../entities/offer'
import {
  meAcceptOffer,
  meArchiveOffer,
  meBlockUser,
  meDeclineOffer,
  meReportOffer,
  meSendOfferMessage,
  meUnarchiveOffer,
} from '../../features/respond-to-offer'
import type { ToastAction, ToastTone } from '../../shared/ui/toast'
import {
  OFFER_ACCEPTED,
  OFFER_ACTION_FAILED,
  OFFER_ARCHIVED_TOAST,
  OFFER_BLOCKED_TOAST,
  OFFER_DECLINED,
  OFFER_REPORTED_TOAST,
  OFFER_UNARCHIVED_TOAST,
  OFFER_UNDO,
  OFFERS_PATH,
} from './constants'

type Show = (message: string | null, options?: { tone?: ToastTone; action?: ToastAction }) => void

const useOfferActions = (offer: OfferGap | undefined, listPath: string, show: Show) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const id = offer?.id ?? ''
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['offer', id] })
    await queryClient.invalidateQueries({ queryKey: ['offer-messages', id] })
    await queryClient.invalidateQueries({ queryKey: ['offers'] })
  }
  const fail = () => show(OFFER_ACTION_FAILED, { tone: 'err' })
  const accept = useMutation({
    mutationFn: () => meAcceptOffer(id),
    onSuccess: async () => {
      show(OFFER_ACCEPTED)
      await refresh()
    },
    onError: fail,
  })
  const decline = useMutation({
    mutationFn: () => meDeclineOffer(id),
    onSuccess: async () => {
      show(OFFER_DECLINED)
      await refresh()
    },
    onError: fail,
  })
  const send = useMutation({
    mutationFn: (body: string) => meSendOfferMessage(id, body),
    onSuccess: refresh,
  })
  const undoArchive = useMutation({
    mutationFn: (offerId: string) => meUnarchiveOffer(offerId),
    onSuccess: async () => {
      show(null)
      await queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: fail,
  })
  const archive = useMutation({
    mutationFn: () => meArchiveOffer(id),
    onSuccess: async () => {
      navigate(listPath)
      show(OFFER_ARCHIVED_TOAST, { action: { label: OFFER_UNDO, onClick: () => undoArchive.mutate(id) } })
      await queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: fail,
  })
  const unarchive = useMutation({
    mutationFn: () => meUnarchiveOffer(id),
    onSuccess: async () => {
      navigate(OFFERS_PATH)
      show(OFFER_UNARCHIVED_TOAST)
      await queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: fail,
  })
  const report = useMutation({
    mutationFn: () => meReportOffer(id),
    onSuccess: () => show(OFFER_REPORTED_TOAST),
    onError: fail,
  })
  const block = useMutation({
    mutationFn: ({ userId }: { userId: string; name: string }) => meBlockUser(userId),
    onSuccess: async (_data, { name }) => {
      navigate(listPath)
      show(OFFER_BLOCKED_TOAST(name))
      await queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: fail,
  })
  return { accept, decline, send, archive, unarchive, report, block }
}

export default useOfferActions
