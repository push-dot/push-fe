import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ContextMenu, ContextMenuItem } from './context-menu'

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

const ContextMenuDemo = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>({ x: 160, y: 80 })
  return (
    <div
      style={{ height: '60vh', border: '1px dashed #ccc', padding: 16 }}
      onContextMenu={(e) => {
        e.preventDefault()
        setPos({ x: e.clientX, y: e.clientY })
      }}
    >
      영역 안에서 우클릭하면 메뉴가 열립니다. ↑↓ 키로 항목을 이동할 수 있습니다.
      {pos ? (
        <ContextMenu x={pos.x} y={pos.y} onClose={() => setPos(null)}>
          <ContextMenuItem icon={<span aria-hidden>✏️</span>}>이름 바꾸기</ContextMenuItem>
          <ContextMenuItem icon={<span aria-hidden>📌</span>}>고정</ContextMenuItem>
          <ContextMenuItem danger icon={<span aria-hidden>🗑</span>}>
            삭제
          </ContextMenuItem>
        </ContextMenu>
      ) : null}
    </div>
  )
}

export const Default: Story = {
  args: { x: 0, y: 0, onClose: () => {} },
  render: () => <ContextMenuDemo />,
}
