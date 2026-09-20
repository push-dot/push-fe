import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input, Select, Textarea } from './input'

const meta = { title: 'Components/Input', component: Input } satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Fields: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
      <Input placeholder="기본 입력" />
      <Input placeholder="에러 상태" error />
      <Input placeholder="비활성" disabled />
      <Textarea placeholder="여러 줄 입력" />
      <Select>
        <option>옵션 A</option>
        <option>옵션 B</option>
      </Select>
    </div>
  ),
}
