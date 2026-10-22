export type PostingActionMode = 'webview' | 'guest' | 'personal' | 'employer'

export const postingActionMode = (input: {
  webView: boolean
  accountType: 'PERSONAL' | 'EMPLOYER' | null
}): PostingActionMode => {
  if (input.webView) return 'webview'
  if (input.accountType === 'EMPLOYER') return 'employer'
  if (input.accountType === 'PERSONAL') return 'personal'
  return 'guest'
}
