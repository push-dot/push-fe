import { SKELETON_ROW_COUNT, SKELETON_ROW_HEIGHT } from './constants'
import Skeleton from './skeleton'

const SkeletonRows = ({
  count = SKELETON_ROW_COUNT,
  height = SKELETON_ROW_HEIGHT,
}: {
  count?: number
  height?: number
}) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} height={height} />
    ))}
  </>
)

export default SkeletonRows
