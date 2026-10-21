import { LINK_COPIED_TOAST } from './constants'

const canShareUrl = (canShare: ((data: { url: string }) => boolean) | undefined, url: string) => {
  if (!canShare) return true
  try {
    return canShare({ url })
  } catch {
    return false
  }
}

export const shareLink = async (input: {
  url: string
  finePointer?: boolean
  canShare?: (data: { url: string }) => boolean
  share?: (data: { url: string }) => Promise<void>
  copy: (url: string) => Promise<void>
}) => {
  const data = { url: input.url }
  const sheet = !input.finePointer && Boolean(input.share) && canShareUrl(input.canShare, input.url)
  if (sheet && input.share) {
    try {
      await input.share(data)
      return null
    } catch {
      await input.copy(input.url)
      return LINK_COPIED_TOAST
    }
  }
  await input.copy(input.url)
  return LINK_COPIED_TOAST
}
