export const accessToken = ({
  webView,
  injected,
  session,
}: {
  webView: boolean
  injected: string | null | undefined
  session: string | null | undefined
}) => (webView ? injected : session)
