import { docCard, docCardMeta, docCardTitle } from '../styles.css'

export type DocCardProps = {
  title: string
  meta: string
  onOpen: () => void
}

const DocCard = ({ title, meta, onOpen }: DocCardProps) => (
  <button type="button" className={docCard} onClick={onOpen}>
    <span className={docCardTitle}>{title}</span>
    <span className={docCardMeta}>{meta}</span>
  </button>
)

export default DocCard
