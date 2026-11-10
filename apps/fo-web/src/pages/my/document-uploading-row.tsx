import { Icon } from '../../shared/ui/icon'
import { DOCUMENT_UPLOAD_CANCEL } from './constants'
import { fileBadgeClass, fileExt, uploadingMeta } from './my-rules'

const DocumentUploadingRow = ({ file, onCancel }: { file: File; onCancel: () => void }) => (
  <div className="doc-line" aria-busy="true">
    <span className={fileBadgeClass(file.name)}>{fileExt(file.name)}</span>
    <span className="doc-copy loading">
      <span className="b1 w7 cap">{file.name}</span>
      <span className="doc-bar">
        <i />
      </span>
      <span className="c1 t3 num">{uploadingMeta(file.size)}</span>
    </span>
    <button type="button" className="hbtn" aria-label={DOCUMENT_UPLOAD_CANCEL} onClick={onCancel}>
      <Icon name="close" size={18} />
    </button>
  </div>
)

export default DocumentUploadingRow
