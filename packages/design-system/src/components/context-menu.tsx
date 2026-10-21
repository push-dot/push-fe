import { Menu } from '@mantine/core'
import type { CSSProperties, ReactNode } from 'react'
import { menuDropdown } from '../styles.css'
import { vars } from '../vars.css'
import { CONTEXT_MENU_OFFSET } from './constants'

export type ContextMenuProps = {
  x: number
  y: number
  onClose: () => void
  children?: ReactNode
  opened?: boolean
}

const anchorStyle = (x: number, y: number): CSSProperties => ({
  position: 'fixed',
  left: x,
  top: y,
  width: 0,
  height: 0,
  pointerEvents: 'none',
})

const ContextMenu = ({ x, y, onClose, children, opened = true }: ContextMenuProps) => (
  <Menu
    opened={opened}
    onChange={(next) => {
      if (!next) onClose()
    }}
    position="bottom-start"
    offset={CONTEXT_MENU_OFFSET}
    zIndex={vars.z.overlay}
    classNames={{ dropdown: menuDropdown }}
  >
    <Menu.Target>
      <span style={anchorStyle(x, y)} />
    </Menu.Target>
    <Menu.Dropdown>{children}</Menu.Dropdown>
  </Menu>
)

export default ContextMenu
