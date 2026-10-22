import { SKELETON_CARD_COUNT, SKELETON_CARD_HEIGHT } from './constants'
import Skeleton from './skeleton'

const SkeletonCardGrid = ({ count = SKELETON_CARD_COUNT }: { count?: number }) => (
  <div className="card-grid">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} height={SKELETON_CARD_HEIGHT} />
    ))}
  </div>
)

export default SkeletonCardGrid
