// Another user chooses what an image URL says, so an http(s) address off the API origin is dropped, not loaded.
// A local preview (blob:, file:, content:, data:image/) is the picker's own and passes.
const LOCAL = /^(?:blob:|file:|content:|ph:|assets-library:|data:image\/)/i

export const absoluteUrl = (url: string | null | undefined, apiBaseUrl: string): string | null => {
  if (!url) return null
  if (LOCAL.test(url)) return url
  try {
    const base = new URL(apiBaseUrl)
    const resolved = new URL(url, base)
    const http = resolved.protocol === 'http:' || resolved.protocol === 'https:'
    return http && resolved.origin === base.origin ? resolved.href : null
  } catch {
    return null
  }
}
