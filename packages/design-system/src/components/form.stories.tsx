import type { Meta, StoryObj } from '@storybook/react'
import { Input, Select } from './input'
import Button from './button'
import { Form, FormRow, FormSection } from './form'

const meta = {
  title: 'Components/Form',
  component: Form,
  args: { children: null },
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

export const Sections: Story = {
  render: () => (
    <Form>
      <FormSection title="계정">
        <FormRow label="이름"><Input placeholder="이름" /></FormRow>
        <FormRow label="역할" hint="힌트 텍스트" />
      </FormSection>
    </Form>
  ),
}

export const WithError: Story = {
  render: () => (
    <Form>
      <FormSection title="계정">
        <FormRow label="이메일"><Input error defaultValue="not-an-email" /></FormRow>
        <FormRow label="이메일" hint="올바른 이메일 형식이 아닙니다" />
      </FormSection>
    </Form>
  ),
}

export const MultiSection: Story = {
  render: () => (
    <Form>
      <FormSection title="프로필">
        <FormRow label="이름"><Input placeholder="이름" /></FormRow>
        <FormRow label="소개"><Input placeholder="한 줄 소개" /></FormRow>
      </FormSection>
      <FormSection title="환경 설정">
        <FormRow label="테마">
          <Select>
            <option>라이트</option>
            <option>다크</option>
          </Select>
        </FormRow>
        <FormRow label="저장"><Button variant="primary" size="sm">저장</Button></FormRow>
      </FormSection>
    </Form>
  ),
}

export const LongLabel: Story = {
  render: () => (
    <Form>
      <FormRow label={'아주 긴 라벨 텍스트가 여기에 들어가는 경우 '.repeat(2)} hint="힌트" />
    </Form>
  ),
}
