import type { Meta, StoryObj } from '@storybook/react-vite'
import Button from './button'
import Dialog from './dialog'

const meta = { title: 'Components/Dialog', component: Dialog } satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    title: '다이얼로그',
    children: '본문 내용',
    actions: (
      <>
        <Button variant="ghost">취소</Button>
        <Button variant="primary">확인</Button>
      </>
    ),
  },
}
