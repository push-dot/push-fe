export type AuthProvider = 'google' | 'github'
export type OAuthStart = {
  authorizationUrl: string
  state: string
  expiresAt: string
}

export type AuthUser = {
  id: string
  displayName: string
  locale: string
  createdAt: string
}
