import { assignInlineVars } from '@vanilla-extract/dynamic'
import { skeleton, skeletonHeight } from '../recipes.css'
import { SKELETON_HEIGHT } from './constants'

const Skeleton = ({ height = SKELETON_HEIGHT }: { height?: number }) => (
  <div className={skeleton} style={assignInlineVars({ [skeletonHeight]: `${height}px` })} />
)

export default Skeleton
