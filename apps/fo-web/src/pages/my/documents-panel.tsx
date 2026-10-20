import type { Source } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { listSources, rememberSource } from '../../shared/api/sources'
import Toast, { useToast } from '../../shared/ui/toast'
import { DOCUMENT_EMPTY, DOCUMENT_ORIGINAL, DOCUMENT_UPLOADED } from './constants'
import { resumeFileError } from './resume-file'

const loadDocuments = async () => {
  const [uploaded, profile] = await Promise.all([listSources(), api.me.profile()])
  if (!profile.resumeSourceId || uploaded.some((item) => item.id === profile.resumeSourceId)) return uploaded
  try {
    const resume = await api.sources.get(profile.resumeSourceId)
    return [resume, ...uploaded]
  } catch {
    return uploaded
  }
}

const DocumentsPanel = () => {
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const query = useQuery({ queryKey: ['documents'], queryFn: loadDocuments })
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.set('file', file)
      form.set('kind', 'resume')
      return api.sources.upload(form)
    },
    onSuccess: async (source: Source) => {
      rememberSource(source)
      show(DOCUMENT_UPLOADED)
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: () => show('이력서 파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  const files = query.data ?? []
  return (
    <section className="stack">
      <h2 className="h3">{query.data ? `내 서류 ${files.length}개` : '내 서류'}</h2>
      {query.isError ? <p className="b2 t3">서류를 불러오지 못했어요.</p> : null}
      {!query.isLoading && files.length === 0 ? <p className="b2 t3">{DOCUMENT_EMPTY}</p> : null}
      <ul className="doc-list">
        {files.map((file) => (
          <li key={file.id} className="doc-row">
            <span className="b2">{file.fileName}</span>
            <span className="c1 t3">{DOCUMENT_ORIGINAL}</span>
          </li>
        ))}
      </ul>
      <label className="primary file-button">
        파일 올리기
        <input
          className="file-input"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            const error = resumeFileError(file)
            if (error) {
              show(error)
              return
            }
            upload.mutate(file)
          }}
        />
      </label>
      <Toast message={message} />
    </section>
  )
}

export default DocumentsPanel
