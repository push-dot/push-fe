import { fileSize, monthDay } from '@push/shared'
import { ingestState } from '../../features/upload-resume'
import { useJob } from '../../shared/api/jobs'
import type { ListedSource } from '../../shared/api/sources'
import { DOCUMENT_INGEST, DOCUMENT_ORIGINAL } from './constants'

const DocumentFileRow = ({ file }: { file: ListedSource }) => {
  const job = useJob(file.jobId)
  const state = ingestState(file.jobId, job.data)
  const ext = file.fileName.split('.').pop()?.toUpperCase() ?? 'FILE'
  return (
    <div className="doc-file">
      <span className={ext === 'PDF' ? 'badge red' : 'badge ac'}>{ext}</span>
      <span className="doc-copy">
        <span className="b1 w7 cap">{file.fileName}</span>
        <span className="c1 t3">{[DOCUMENT_ORIGINAL, monthDay(file.createdAt), fileSize(file.size)].filter(Boolean).join(' · ')}</span>
      </span>
      {state ? <span className={state === 'failed' ? 'badge red' : 'badge grey'}>{DOCUMENT_INGEST[state]}</span> : null}
    </div>
  )
}

export default DocumentFileRow
