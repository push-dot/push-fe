import type { UploadedSource } from '@push/api-client'
import { ingestState } from '../../features/upload-resume'
import { useJob } from '../../shared/api/jobs'
import { DOCUMENT_INGEST, DOCUMENT_ORIGINAL } from './constants'

const fileSize = (size: number) => (size >= 1048576 ? `${(size / 1048576).toFixed(1)}MB` : `${Math.max(1, Math.round(size / 1024))}KB`)

const fileWhen = (iso?: string) => {
  if (!iso) return null
  const date = new Date(iso)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

const DocumentFileRow = ({ file }: { file: UploadedSource }) => {
  const job = useJob(file.jobId)
  const state = ingestState(file.jobId, job.data)
  const ext = file.fileName.split('.').pop()?.toUpperCase() ?? 'FILE'
  return (
    <div className="doc-file">
      <span className={ext === 'PDF' ? 'badge red' : 'badge ac'}>{ext}</span>
      <span className="doc-copy">
        <span className="b1 w7 cap">{file.fileName}</span>
        <span className="c1 t3">{[DOCUMENT_ORIGINAL, fileWhen(file.createdAt), fileSize(file.size)].filter(Boolean).join(' · ')}</span>
      </span>
      {state ? <span className={state === 'failed' ? 'badge red' : 'badge grey'}>{DOCUMENT_INGEST[state]}</span> : null}
    </div>
  )
}

export default DocumentFileRow
