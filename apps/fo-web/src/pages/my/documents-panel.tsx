import type { Source } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { useDocuments } from '../../entities/profile'
import { rememberSource } from '../../shared/api/sources'
import Toast, { useToast } from '../../shared/ui/toast'
import { DOCUMENT_AI_LABEL, DOCUMENT_EMPTY, DOCUMENT_ORIGINAL, DOCUMENT_UPLOADED, DROP_HINT, DROP_TITLE } from './constants'
import { resumeFileError } from './resume-file'
import { sourcesUpload } from '../../shared/api/operations'

const fileSize = (size: number) => (size >= 1048576 ? `${(size / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(size / 1024))}KB`)

const fileWhen = (iso?: string) => {
  if (!iso) return null
  const date = new Date(iso)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

const DocumentsPanel = () => {
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const query = useDocuments()
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.set('file', file)
      form.set('kind', 'resume')
      return sourcesUpload(form)
    },
    onSuccess: async (source: Source) => {
      rememberSource(source)
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
          {files.map((file) => {
            const ext = file.fileName.split('.').pop()?.toUpperCase() ?? 'FILE'
            const when = fileWhen(file.createdAt)
            return (
              <div key={file.id} className="doc-file">
                <span className={ext === 'PDF' ? 'badge red' : 'badge ac'}>{ext}</span>
                <span className="doc-copy">
                  <span className="b1 w7 cap">{file.fileName}</span>
                  <span className="c1 t3">{[DOCUMENT_ORIGINAL, when, fileSize(file.size)].filter(Boolean).join(' · ')}</span>
                </span>
              </div>
            )
          })}
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
