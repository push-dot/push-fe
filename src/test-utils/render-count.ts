const counts = new Map<string, number>()

export const bumpRenderCount = (name: string) => {
  counts.set(name, (counts.get(name) ?? 0) + 1)
}

export const getRenderCount = (name: string) => counts.get(name) ?? 0

export const resetRenderCounts = () => {
  counts.clear()
}
