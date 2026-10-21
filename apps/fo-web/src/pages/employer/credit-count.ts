const MICRO_PER_CREDIT = 1000

export const creditCount = (micro: number) => Math.round(micro / MICRO_PER_CREDIT)

export const creditText = (count: number) => new Intl.NumberFormat('en-US').format(count)
