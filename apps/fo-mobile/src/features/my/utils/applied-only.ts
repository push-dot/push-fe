import type { Application } from '@push/api-client'

export const appliedOnly = (list: Application[]) => list.filter((a) => a.appliedAt)
