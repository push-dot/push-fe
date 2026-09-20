import spriteRaw from '@/theme/icons.svg?raw'
import { sprinkles } from '@pushdot/design'

const IconSprite = () => (
  <div
    className={sprinkles({ display: 'none' })}
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: spriteRaw }}
  />
)

export default IconSprite
