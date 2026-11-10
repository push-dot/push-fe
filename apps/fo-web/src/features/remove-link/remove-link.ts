import { meDeleteLink, meRestoreLink } from '../../shared/api/operations'

export const removeLink = (id: string) => meDeleteLink(id)

export const restoreLink = (id: string) => meRestoreLink(id)
