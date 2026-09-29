import type { Meta, StoryObj } from '@storybook/react'
import StatusChip from './status-chip'
import { DataList, DataListRow } from './data-list'

const meta = {
  title: 'Components/DataList',
  component: DataList,
  args: { children: null },
} satisfies Meta<typeof DataList>

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

export const ClickableRows: Story = {
  render: () => (
    <DataList>
      <DataListRow title="열기 가능" meta="버튼 행" onClick={() => undefined} />
      <DataListRow title="또 다른 행" onClick={() => undefined} trailing={<StatusChip tone="running" label="RUNNING" />} />
    </DataList>
  ),
}

export const LongText: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <DataList>
        <DataListRow
          title={'아주 긴 행 제목이 여기에 들어가서 잘리거나 줄바꿈되는 경우 '.repeat(2)}
          meta={'긴 메타 텍스트 '.repeat(6)}
          trailing={<StatusChip tone="pending" label="PENDING" />}
        />
      </DataList>
    </div>
  ),
}

export const Empty: Story = {
  render: () => <DataList>{null}</DataList>,
}
