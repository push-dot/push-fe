import type { Meta, StoryObj } from '@storybook/react'
import DocCard from './doc-card'

const meta = {
  title: 'Components/DocCard',
  component: DocCard,
  args: {
    title: '이력서 v1',
    meta: '수정됨 · 2026-09-20',
    onOpen: () => undefined,
  },
} satisfies Meta<typeof DocCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongTitle: Story = {
  args: {
    title: '2026년 상반기 인프랩 지원용 프론트엔드 엔지니어 이력서 최종본 v3',
    meta: '마지막 편집 · 2026-09-30 14:22',
  },
}

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 640 }}>
      <DocCard title="이력서 v1" meta="2026-09-20" onOpen={() => undefined} />
      <DocCard title="포트폴리오" meta="2026-09-18" onOpen={() => undefined} />
      <DocCard title="자기소개서" meta="2026-09-15" onOpen={() => undefined} />
    </div>
  ),
}
