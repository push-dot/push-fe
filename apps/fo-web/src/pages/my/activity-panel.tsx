import ApplyPanel from './apply-panel'
import BookmarkPanel from './bookmark-panel'
import CalendarPanel from './calendar-panel'
import { ACTIVITY_CHIP_KEY } from './constants'
import FollowPanel from './follow-panel'
import PostsPanel from './posts-panel'

const PANELS = {
  applications: ApplyPanel,
  calendar: CalendarPanel,
  bookmarks: BookmarkPanel,
  follows: FollowPanel,
  posts: PostsPanel,
} as const

const ActivityPanel = ({ chip }: { chip: string }) => {
  const Panel = PANELS[ACTIVITY_CHIP_KEY[chip as keyof typeof ACTIVITY_CHIP_KEY]]
  return <Panel />
}

export default ActivityPanel
