import type { Meta, StoryObj } from '@storybook/react'
import StatusChip from './status-chip'

const meta = {
  title: 'Components/StatusChip',
  component: StatusChip,
  argTypes: {
    tone: { control: 'select', options: ['ready', 'running', 'verified', 'pending', 'error'] },
  },
  args: { tone: 'ready', label: 'READY' },
} satisfies Meta<typeof StatusChip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

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

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatusChip tone="running" label="RUNNING" icon={<span aria-hidden>●</span>} />
      <StatusChip tone="error" label="ERROR" icon={<span aria-hidden>✕</span>} />
    </div>
  ),
}

export const LongLabel: Story = {
  args: {
    tone: 'pending',
    label: 'WAITING FOR USER CONFIRMATION',
  },
}
