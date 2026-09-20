import type { Meta, StoryObj } from '@storybook/react-vite'
import StatusChip from './status-chip'

const meta = {
  title: 'Components/StatusChip',
  component: StatusChip,
  argTypes: {
    tone: { control: 'select', options: ['ready', 'running', 'verified', 'pending', 'error'] },
  },
} satisfies Meta<typeof StatusChip>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatusChip tone="ready" label="READY" />
      <StatusChip tone="running" label="RUNNING" />
      <StatusChip tone="verified" label="VERIFIED" />
      <StatusChip tone="pending" label="PENDING" />
      <StatusChip tone="error" label="ERROR" />
    </div>
  ),
}
