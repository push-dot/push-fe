import type { SocialAuthor } from '@push/api-client'
import { brandColor } from '@push/shared'

import { authorLabel } from '../../entities/post'
import { assetUrl } from '../../shared/api/client'
import { initials } from '../../shared/lib/format'

const AuthorAvatar = ({ author, size }: { author: SocialAuthor; size: 36 | 40 | 48 }) => {
  const name = authorLabel(author)
  const className = `sav sav-${size}${author.employer ? ' biz' : ''}`
  if (author.avatarUrl) return <img className={className} src={assetUrl(author.avatarUrl)} alt="" />
  return (
    <span className={className} style={{ background: brandColor(name) }} aria-hidden="true">
      {author.employer ? [...name][0] : initials(name)}
    </span>
  )
}

export default AuthorAvatar
