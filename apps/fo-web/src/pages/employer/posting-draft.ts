const textOf = (value: unknown) => (typeof value === 'string' ? value : '')

export const listFromLines = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

const linesFromList = (value: unknown) => (Array.isArray(value) ? value.map(String).join('\n') : textOf(value))

export const textFromConditions = (value: unknown) => {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
  return Object.values(value)
    .filter((item): item is string => typeof item === 'string')
    .join('\n')
}

export const conditionsFromText = (text: string) => ({ 조건: text })

export const draftFields = (state: {
  title?: unknown
  description?: unknown
  requirements?: unknown
  preferred?: unknown
  workConditions?: unknown
}) => ({
  title: textOf(state.title),
  description: textOf(state.description),
  requirements: linesFromList(state.requirements),
  preferred: linesFromList(state.preferred),
  workConditions: textFromConditions(state.workConditions),
})
