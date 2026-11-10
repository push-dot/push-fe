import { ingestState } from '../../features/upload-resume'
import { useJob } from '../../shared/api/jobs'
import type { ListedSource } from '../../shared/api/sources'
import { Icon } from '../../shared/ui/icon'
import type { MenuItem } from '../../shared/ui/popover'
import { DOCUMENT_INGEST, DOCUMENT_VIEW } from './constants'
import { fileBadgeClass, fileExt, uploadMeta } from './my-rules'
import RowMore from './row-more'

type DocumentFileRowProps = {
  file: ListedSource
  fresh: boolean
  menu: MenuItem[]
  onView: () => void
}

const DocumentFileRow = ({ file, fresh, menu, onView }: DocumentFileRowProps) => {
  const job = useJob(file.jobId)
  const state = ingestState(file.jobId, job.data)
  return (
    <div className={fresh ? 'doc-line fresh' : 'doc-line'}>
      <span className={fileBadgeClass(file.fileName)}>{fileExt(file.fileName)}</span>
      <span className="doc-copy">
        <span className="b1 w7 cap">{file.fileName}</span>
        <span className="c1 t3">{uploadMeta(file)}</span>
      </span>
      {state ? (
        <span className={state === 'failed' ? 'badge red' : 'badge grey'}>
          {DOCUMENT_INGEST[state]}
        </span>
      ) : null}
      <button type="button" className="btn sec sm" onClick={onView}>
        <Icon name="eye" size={16} />
        {DOCUMENT_VIEW}
      </button>
      <RowMore label={file.fileName} items={menu} />
    </div>
  )
}

export default DocumentFileRow
