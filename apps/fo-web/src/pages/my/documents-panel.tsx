import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { useDocuments } from '../../entities/profile'
import { resumeFileError, uploadResume } from '../../features/upload-resume'
import Toast, { useToast } from '../../shared/ui/toast'
import DocumentFileRow from './document-file-row'
import { DOCUMENT_AI_LABEL, DOCUMENT_EMPTY, DOCUMENT_UPLOADED, DROP_HINT, DROP_TITLE } from './constants'

const DocumentsPanel = () => {
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const query = useDocuments()
  const upload = useMutation({
    mutationFn: (file: File) => uploadResume(file),
    onSuccess: async () => {
      show(DOCUMENT_UPLOADED)
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: () => show('이력서 파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  const files = query.data ?? []
  const take = (file: File | undefined) => {
    if (!file) return
    const error = resumeFileError(file)
    if (error) {
      show(error)
      return
    }
    upload.mutate(file)
  }
  return (
    <section className="stack">
      <div className="preview-head">
        <span className="b2 t3">{query.data ? `내 서류 ${files.length}개` : '내 서류'}</span>
        <button type="button" className="btn pri sm" onClick={() => inputRef.current?.click()}>
          파일 올리기
        </button>
      </div>
      <p className="c1 t3">{DOCUMENT_AI_LABEL}</p>
      {query.isError ? <p className="b2 t3">서류를 불러오지 못했어요.</p> : null}
      {!query.isLoading && files.length === 0 ? <p className="b2 t3">{DOCUMENT_EMPTY}</p> : null}
      {files.length ? (
        <div className="box">
          {files.map((file) => (
            <DocumentFileRow key={file.id} file={file} />
          ))}
        </div>
      ) : null}
      <label
        className="drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          take(event.dataTransfer.files[0])
        }}
      >
        <span className="b1 w7">{DROP_TITLE}</span>
        <span className="c1 t3">{DROP_HINT}</span>
        <input
          ref={inputRef}
          className="file-input"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            take(file)
          }}
        />
      </label>
      <Toast message={message} />
    </section>
  )
}

export default DocumentsPanel
