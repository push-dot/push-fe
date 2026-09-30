import { Tooltip as MantineTooltip } from '@mantine/core'
import type { TooltipProps as MantineTooltipProps } from '@mantine/core'
import { vars } from '../vars.css'

export type TooltipProps = Pick<
  MantineTooltipProps,
  'label' | 'children' | 'disabled' | 'position' | 'openDelay' | 'withArrow'
>

const Tooltip = (props: TooltipProps) => (
  <MantineTooltip
    withArrow
    vars={() => ({
      tooltip: {
        '--tooltip-bg': vars.color.text,
        '--tooltip-color': vars.color.bg,
        '--tooltip-radius': vars.radius.sm,
      },
    })}
    {...props}
  />
)

export default Tooltip
