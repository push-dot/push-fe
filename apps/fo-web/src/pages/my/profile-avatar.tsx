import { brandColor } from '@push/shared'
import { initials } from '../../shared/lib/format'

const ProfileAvatar = ({ name, src }: { name: string; src?: string }) =>
  src ? (
    <img className="av mp-av" src={src} alt="" />
  ) : (
    <span className="av mp-av" style={{ background: brandColor(name) }}>
      {initials(name)}
    </span>
  )

export default ProfileAvatar
