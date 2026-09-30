import type { Meta, StoryObj } from '@storybook/react'
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

export const WithoutActions: Story = {
  args: {
    open: true,
    title: '알림',
    children: '액션 없는 다이얼로그',
  },
}

export const Destructive: Story = {
  args: {
    open: true,
    title: '문서 삭제',
    children: '이 문서를 삭제하면 되돌릴 수 없습니다.',
    actions: (
      <>
        <Button variant="ghost">취소</Button>
        <Button variant="danger">삭제</Button>
      </>
    ),
  },
}

export const LongContent: Story = {
  args: {
    open: true,
    title: '아주 긴 다이얼로그 제목이 여기에 들어가서 한 줄을 넘어가는 경우',
    children: '긴 본문. '.repeat(80),
    actions: <Button variant="primary">확인</Button>,
  },
}
