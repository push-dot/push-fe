import { meUpdateProfile as call0, uploadsImage } from '../../shared/api/operations'

export const meUpdateProfile = (...args: Parameters<typeof call0>) => call0(...args)

export const uploadAvatar = (file: File) => {
  const form = new FormData()
  form.set('file', file)
  return uploadsImage(form)
}
