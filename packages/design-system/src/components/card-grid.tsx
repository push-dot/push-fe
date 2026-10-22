import type { ReactNode } from 'react'
import { cardGrid } from '../styles.css'

const CardGrid = ({ children }: { children: ReactNode }) => <div className={cardGrid}>{children}</div>

export default CardGrid
