import type { ReactNode } from 'react'
import { cardMeta, dataList, dataListMain, dataListRow } from '../styles.css'

const DataList = ({ children }: { children: ReactNode }) => (
  <div className={dataList}>{children}</div>
)

export type DataListRowProps = {
  title: string
  meta?: string
  trailing?: ReactNode
  onClick?: () => void
}

const DataListRow = ({ title, meta, trailing, onClick }: DataListRowProps) => {
  const inner = (
    <>
      <div className={dataListMain}>
        <div className="t-body">{title}</div>
        {meta ? <div className={cardMeta}>{meta}</div> : null}
      </div>
      {trailing}
    </>
  )
  const cls = dataListRow({ clickable: Boolean(onClick) })
  return onClick ? (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export { DataList, DataListRow }
