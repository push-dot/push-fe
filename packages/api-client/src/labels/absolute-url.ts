export const absoluteUrl = (url: string | null | undefined, apiBaseUrl: string): string | null =>
  !url ? null : url.startsWith('/') ? new URL(url, apiBaseUrl).href : url
