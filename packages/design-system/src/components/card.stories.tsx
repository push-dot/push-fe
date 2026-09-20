import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardGrid } from './card'
import DocCard from './doc-card'

const meta = { title: 'Components/Card', component: Card } satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: { title: '카드 제목', meta: '메타 정보', children: '카드 본문' },
}

export const Clickable: Story = {
  args: { title: '클릭 가능한 카드', meta: 'hover 시 테두리', onClick: () => undefined },
}

export const Grid: Story = {
  render: () => (
    <CardGrid>
      <Card title="A" meta="meta" />
      <Card title="B" meta="meta" />
      <Card title="C" meta="meta" />
    </CardGrid>
  ),
}

export const Doc: Story = {
  render: () => <DocCard title="이력서 v1" meta="2026-09-20" onOpen={() => undefined} />,
}
