import type { Meta, StoryObj } from '@storybook/react'
import Button from './button'
import StatusChip from './status-chip'
import CanvasHeader from './canvas-header'

const meta = {
  title: 'Components/CanvasHeader',
  component: CanvasHeader,
  args: { title: '페이지 제목' },
} satisfies Meta<typeof CanvasHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithActions: Story = {
  args: {
    actions: <Button variant="primary" size="sm">액션</Button>,
  },
}

export const HeadingLevel2: Story = {
  args: {
    title: '섹션 제목',
    headingLevel: 2,
    actions: <StatusChip tone="running" label="RUNNING" />,
  },
}

export const LongTitle: Story = {
  args: {
    title: '아주 긴 페이지 제목이 여기에 들어가서 여러 줄로 표시되거나 잘리는 경우를 확인한다',
    actions: (
      <>
        <Button variant="ghost" size="sm">취소</Button>
        <Button variant="primary" size="sm">저장</Button>
      </>
    ),
  },
}
