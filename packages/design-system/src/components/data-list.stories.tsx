import type { Meta, StoryObj } from '@storybook/react-vite'
import StatusChip from './status-chip'
import { DataList, DataListRow } from './data-list'

const meta = { title: 'Components/DataList', component: DataList } satisfies Meta<typeof DataList>

export default meta
type Story = StoryObj<typeof meta>

export const Rows: Story = {
  render: () => (
    <DataList>
      <DataListRow title="항목 1" meta="메타" trailing={<StatusChip tone="verified" label="OK" />} />
      <DataListRow title="항목 2" meta="클릭 가능" onClick={() => undefined} />
      <DataListRow title="항목 3" />
    </DataList>
  ),
}
