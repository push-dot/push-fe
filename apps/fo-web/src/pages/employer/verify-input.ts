export const digitsOf = (value: string) => value.replace(/\D/g, '')

const grouped = (value: string, limit: number, sizes: number[], separator: string) => {
  const digits = digitsOf(value).slice(0, limit)
  const parts: string[] = []
  let cursor = 0
  sizes.forEach((size) => {
    if (cursor >= digits.length) return
    parts.push(digits.slice(cursor, cursor + size))
    cursor += size
  })
  return parts.join(separator)
}

export const formatBno = (value: string) => grouped(value, 10, [3, 2, 5], '-')

export const formatStartDt = (value: string) => grouped(value, 8, [4, 2, 2], '. ')
