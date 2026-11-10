import type { ReactNode } from 'react'

const DocumentGroup = ({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) => (
  <div>
    <div className="b2 w7 t3 doc-group-head">
      {title}
      {note ? <span className="doc-group-note">{` · ${note}`}</span> : null}
    </div>
    <div className="box doc-box">{children}</div>
  </div>
)

export default DocumentGroup
