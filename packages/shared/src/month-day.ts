export const monthDay = (iso: string | null) => {
  if (!iso) return null
  const [, month, day] = iso.slice(0, 10).split('-').map(Number)
  if (!month || !day) return null
  return `${month}월 ${day}일`
}
