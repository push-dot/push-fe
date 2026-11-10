import { brandColor } from '@push/shared'

import { initials } from '../../shared/lib/format'

const OfferAvatar = ({ name }: { name: string }) => (
  <span className="av" style={{ background: brandColor(name) }}>
    {initials(name)}
  </span>
)

export default OfferAvatar
