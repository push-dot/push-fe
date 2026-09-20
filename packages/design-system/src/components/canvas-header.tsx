import type { ReactNode } from 'react'
import { canvasHeader, canvasHeaderActions, canvasHeaderTitle } from '../styles.css'

export type CanvasHeaderProps = {
  title: string
  actions?: ReactNode
  headingLevel?: 1 | 2
}

const CanvasHeader = ({ title, actions, headingLevel = 1 }: CanvasHeaderProps) => (
  <div className={canvasHeader}>
    {headingLevel === 1 ? (
      <h1 className={canvasHeaderTitle}>{title}</h1>
    ) : (
      <h2 className={canvasHeaderTitle}>{title}</h2>
    )}
    <div className={canvasHeaderActions}>{actions}</div>
  </div>
)

export default CanvasHeader
