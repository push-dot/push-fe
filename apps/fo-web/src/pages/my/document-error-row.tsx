import { Icon } from '../../shared/ui/icon'
import { CLOSE_LABEL } from './constants'

const DocumentErrorRow = ({
  name,
  text,
  onClose,
}: {
  name: string
  text: string
  onClose: () => void
}) => (
  <div className="doc-line err" role="alert">
    <span className="doc-warn">
      <Icon name="warn" size={22} />
    </span>
    <span className="doc-copy">
      <span className="b1 w7 cap">{name}</span>
      <span className="c1 w6 doc-err-text">{text}</span>
    </span>
    <button type="button" className="hbtn" aria-label={CLOSE_LABEL} onClick={onClose}>
      <Icon name="close" size={18} />
    </button>
  </div>
)

export default DocumentErrorRow
