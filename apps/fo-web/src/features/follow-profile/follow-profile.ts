import { profilesFollow as call0, profilesUnfollow as call1 } from '../../shared/api/operations'

export const profilesFollow = (...args: Parameters<typeof call0>) => call0(...args)
export const profilesUnfollow = (...args: Parameters<typeof call1>) => call1(...args)
