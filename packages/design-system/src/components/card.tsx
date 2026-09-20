import type { ReactNode } from 'react'
import { card, cardGrid, cardMeta, cardTitle } from '../styles.css'

export type CardProps = {
  title?: string
  meta?: string
  children?: ReactNode
  onClick?: () => void
}

const Card = ({ title, meta, children, onClick }: CardProps) => {
  const cls = card({ clickable: Boolean(onClick) })
  const inner = (
    <>
      {title ? <div className={cardTitle}>{title}</div> : null}
      {meta ? <div className={cardMeta}>{meta}</div> : null}
      {children}
    </>
  )
  return onClick ? (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

const CardGrid = ({ children }: { children: ReactNode }) => (
  <div className={cardGrid}>{children}</div>
)

export { Card, CardGrid }
export default Card
