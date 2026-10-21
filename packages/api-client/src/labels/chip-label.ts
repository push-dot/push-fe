export const chipLabel = (fallback: string, selected: string[]): string =>
  selected.length === 0 ? fallback : selected.length === 1 ? selected[0]! : `${selected[0]} 외 ${selected.length - 1}`
