import { rememberSource } from '../../shared/api/sources'
import { sourcesUpload } from '../../shared/api/operations'

export const uploadResume = async (file: File) => {
  const form = new FormData()
  form.set('file', file)
  form.set('kind', 'resume')
  const source = await sourcesUpload(form)
  rememberSource(source)
  return source
}
