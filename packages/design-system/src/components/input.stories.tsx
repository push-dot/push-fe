import type { Meta, StoryObj } from '@storybook/react'
import { Input, Select, Textarea } from './input'

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: '기본 입력' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <Input placeholder="기본 입력" />
      <Input placeholder="에러 상태" error />
      <Input placeholder="비활성" disabled />
      <Input defaultValue="채워진 값" />
    </div>
  ),
}

export const LongValue: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <Input defaultValue={'아주 긴 입력 값 — '.repeat(12)} />
    </div>
  ),
}

export const TextareaField: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <Textarea placeholder="여러 줄 입력" />
      <Textarea defaultValue={'긴 본문\n'.repeat(20)} />
      <Textarea placeholder="비활성" disabled />
    </div>
  ),
}

export const SelectField: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <Select>
        <option>옵션 A</option>
        <option>옵션 B</option>
      </Select>
      <Select disabled>
        <option>비활성</option>
      </Select>
    </div>
  ),
}
