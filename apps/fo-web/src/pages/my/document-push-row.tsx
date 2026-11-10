import type { SourceItem } from '@push/api-client'
import { Icon } from '../../shared/ui/icon'
import type { MenuItem } from '../../shared/ui/popover'
import { DOCUMENT_VIEW } from './constants'
import { pushDocumentMeta } from './my-rules'
import RowMore from './row-more'

type DocumentPushRowProps = { item: SourceItem; menu: MenuItem[]; onView: () => void }

const DocumentPushRow = ({ item, menu, onView }: DocumentPushRowProps) => (
  <div className="doc-line push">
    <span className="doc-tile">
      <Icon name="doc" size={20} />
    </span>
    <span className="doc-copy">
      <span className="b1 w7 cap">{item.fileName}</span>
      <span className="c1 t3 cap">{pushDocumentMeta(item)}</span>
    </span>
    <button type="button" className="btn sec sm" onClick={onView}>
      <Icon name="eye" size={16} />
      {DOCUMENT_VIEW}
    </button>
    <RowMore label={item.fileName} items={menu} />
  </div>
)

export default DocumentPushRow
