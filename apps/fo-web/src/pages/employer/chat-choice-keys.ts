/** The option the arrow keys move to; null for any other key. Wraps at both ends. */
export const stepOption = (key: string, index: number, count: number) => {
  if (count <= 0) return null
  if (key === 'ArrowDown') return (index + 1) % count
  if (key === 'ArrowUp') return (index - 1 + count) % count
  return null
}
