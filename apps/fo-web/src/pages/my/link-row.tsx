import type { UserLink } from '@push/api-client'
import { brandColor } from '@push/shared'
import { GithubMark, Icon, type IconName } from '../../shared/ui/icon'
import type { MenuItem } from '../../shared/ui/popover'
import { LINK_KINDS, LINK_TILE } from './constants'
import { linkCompany, linkHost } from './my-rules'
import RowMore from './row-more'

const KIND_ICON: Record<Exclude<UserLink['kind'], 'github'>, IconName> = {
  job: 'brief',
  portfolio: 'doc',
  blog: 'pencil',
  other: 'link',
}

const LinkRow = ({ link, menu }: { link: UserLink; menu: MenuItem[] }) => {
  const host = linkHost(link.url)
  const title = link.title || host
  const label = LINK_KINDS.find((entry) => entry.key === link.kind)?.label ?? link.kind
  return (
    <div className="link-item">
      <span
        className="link-tile"
        style={{
          background: link.kind === 'job' ? brandColor(linkCompany(title)) : LINK_TILE[link.kind],
        }}
      >
        {link.kind === 'github' ? <GithubMark /> : <Icon name={KIND_ICON[link.kind]} size={20} />}
      </span>
      <span className="doc-copy">
        <span className="b1 w7 cap">{title}</span>
        <span className="c1 t3 cap">{host}</span>
      </span>
      <span className={link.kind === 'job' ? 'badge ac' : 'badge grey'}>{label}</span>
      <RowMore label={title} items={menu} />
    </div>
  )
}

export default LinkRow
