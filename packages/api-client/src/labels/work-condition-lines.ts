export const workConditionLines = (w: unknown): string[] => {
  if (Array.isArray(w)) return w.map(String)
  if (!w || typeof w !== 'object') return []
  return Object.entries(w).flatMap(([k, v]) => {
    const text = Array.isArray(v) ? v.join(', ') : v == null || typeof v === 'object' ? '' : String(v)
    return text ? [`${k} · ${text}`] : []
  })
}
