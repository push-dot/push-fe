import type { ReactNode } from 'react'
import { dataList } from '../styles.css'

const DataList = ({ children }: { children: ReactNode }) => <div className={dataList}>{children}</div>

export default DataList
