const FENCE_RE = /^\s*(`{3,}|~{3,})/

export const splitStableMarkdown = (text: string): { stable: string; tail: string } => {
  let fence: string | null = null
  let cut = 0
  let lineStart = 0
  for (let i = 0; i <= text.length; i++) {
    if (i !== text.length && text[i] !== '\n') continue
    const line = text.slice(lineStart, i)
    const match = line.match(FENCE_RE)
    if (match) {
      const marker = match[1][0]
      if (fence === null) {
        fence = marker
      } else if (marker === fence) {
        fence = null
        cut = i + 1
      }
    } else if (fence === null && line.trim() === '') {
      cut = i + 1
    }
    lineStart = i + 1
  }
  return { stable: text.slice(0, cut), tail: text.slice(cut) }
}
