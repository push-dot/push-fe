import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton, SkeletonCardGrid, SkeletonRows } from './skeleton'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { height: 16 },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Heights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 360 }}>
      <Skeleton height={16} />
      <Skeleton height={32} />
      <Skeleton height={96} />
    </div>
  ),
}

export const Rows: Story = { render: () => <SkeletonRows count={3} /> }

export const CardGrid: Story = { render: () => <SkeletonCardGrid count={3} /> }
