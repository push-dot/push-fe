import bookmarks from '@push/design-system/assets/icons-3d/bookmark.svg'
import jobs from '@push/design-system/assets/icons-3d/brief.svg'
import activity from '@push/design-system/assets/icons-3d/chart.svg'

export type ShortcutKey = 'jobs' | 'bookmarks' | 'activity'

export const SHORTCUT_ART: Record<ShortcutKey, string> = { jobs, bookmarks, activity }

const ShortcutArt = ({ name }: { name: ShortcutKey }) => <img src={SHORTCUT_ART[name]} width={76} height={76} alt="" />

export default ShortcutArt
