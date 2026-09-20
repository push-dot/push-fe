import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'
import { Form, FormRow, FormSection } from './form'

const meta = { title: 'Components/Form', component: Form } satisfies Meta<typeof Form>

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
