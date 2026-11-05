/** Theme from the WebView query. Anything else leaves the existing prefers-color-scheme rule. */
export const themeFromQuery = (value: string | null, alreadySet: boolean) => {
  if (alreadySet) return null
  if (value === 'light' || value === 'dark') return value
  return null
}
