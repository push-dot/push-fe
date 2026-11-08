import { Glass } from '@/shared/components'
import { radius } from '../../../theme'
import { ComposerBody, type ComposerProps } from './composer-body'

/** iOS: Liquid Glass box, 28px radius. A surface, not a press target: interactive glass around the input and its buttons dropped taps. */
export const Composer = (p: ComposerProps) => {
  return (
    <Glass style={{ borderRadius: radius.xl }}>
      <ComposerBody {...p} />
    </Glass>
  )
}
