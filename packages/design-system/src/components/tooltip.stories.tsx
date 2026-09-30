import type { Meta, StoryObj } from '@storybook/react'
import Button from './button'
import Tooltip from './tooltip'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    label: '단축키 ⌘B',
    children: <Button variant="secondary">Hover me</Button>,
  },
}

export const Positions: Story = {
  args: { label: 'tooltip' },
  render: () => (
    <div style={{ display: 'flex', gap: 8, padding: 48 }}>
      <Tooltip label="위쪽" position="top">
        <Button variant="ghost">Top</Button>
      </Tooltip>
      <Tooltip label="오른쪽" position="right">
        <Button variant="ghost">Right</Button>
      </Tooltip>
      <Tooltip label="아래쪽" position="bottom">
        <Button variant="ghost">Bottom</Button>
      </Tooltip>
      <Tooltip label="왼쪽" position="left">
        <Button variant="ghost">Left</Button>
      </Tooltip>
    </div>
  ),
}
