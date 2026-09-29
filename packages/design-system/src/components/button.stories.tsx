import type { Meta, StoryObj } from '@storybook/react'
import Button from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { children: '버튼', variant: 'primary', size: 'md' } }

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary" loading>Loading</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="secondary" selected>Selected</Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary" icon={<span aria-hidden>＋</span>}>새 문서</Button>
      <Button variant="ghost" icon={<span aria-hidden>✕</span>} size="sm">닫기</Button>
    </div>
  ),
}

export const LongText: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Button variant="primary">
        아주 긴 버튼 라벨 텍스트가 이 안에 들어가서 줄바꿈되는 경우
      </Button>
    </div>
  ),
}
