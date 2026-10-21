import { LINK_COPIED_TOAST } from './constants'

export const shareLink = async (input: {
  url: string
  share?: (data: { url: string }) => Promise<void>
  copy: (url: string) => Promise<void>
}) => {
  if (input.share) {
    try {
      await input.share({ url: input.url })
      return null
    } catch {
      await input.copy(input.url)
      return LINK_COPIED_TOAST
    }
  }
  await input.copy(input.url)
  return LINK_COPIED_TOAST
}
