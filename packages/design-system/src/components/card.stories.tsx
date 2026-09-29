import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardGrid } from './card'

const meta = { title: 'Components/Card', component: Card } satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: { title: '카드 제목', meta: '메타 정보', children: '카드 본문' },
}

export const Clickable: Story = {
  args: { title: '클릭 가능한 카드', meta: 'hover 시 테두리', onClick: () => undefined },
}

export const NoTitle: Story = {
  args: { children: '제목 없이 본문만 있는 카드' },
}

export const LongText: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Card
        title={'아주 긴 카드 제목 '.repeat(6)}
        meta={'긴 메타 정보 '.repeat(8)}
      >
        {'카드 본문이 여러 줄에 걸쳐 아주 길게 이어지는 경우. '.repeat(10)}
      </Card>
    </div>
  ),
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
