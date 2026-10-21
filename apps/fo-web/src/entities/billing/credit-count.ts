import { MICRO_PER_CREDIT } from './constants'

export const creditCount = (micro: number) => Math.round(micro / MICRO_PER_CREDIT)

export const creditText = (count: number) => new Intl.NumberFormat('en-US').format(count)
