import { PKCE_VERIFIER_KEY } from './constants'

const toBase64Url = (bytes: Uint8Array) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '')
}

export const createPkce = async () => {
  const random = new Uint8Array(32)
  crypto.getRandomValues(random)
  const verifier = toBase64Url(random)
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
  return { verifier, challenge: toBase64Url(digest) }
}

export const savePkceVerifier = (verifier: string) => {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
}

export const takePkceVerifier = () => {
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  return verifier
}
