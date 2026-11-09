import { companiesUpdate, uploadsImage } from '../../shared/api/operations'

export const changeCompanyLogo = async (file: File) => {
  const form = new FormData()
  form.set('file', file)
  const { key } = await uploadsImage(form)
  return companiesUpdate({ logoKey: key })
}
