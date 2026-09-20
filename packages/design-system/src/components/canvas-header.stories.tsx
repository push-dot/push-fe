import type { Meta, StoryObj } from '@storybook/react-vite'
import Button from './button'
import CanvasHeader from './canvas-header'

const meta = {
  title: 'Components/CanvasHeader',
  component: CanvasHeader,
} satisfies Meta<typeof CanvasHeader>

export default meta
type Story = StoryObj<typeof meta>

export const WithActions: Story = {
  args: {
    title: '페이지 제목',
    actions: <Button variant="primary" size="sm">액션</Button>,
  },
}
