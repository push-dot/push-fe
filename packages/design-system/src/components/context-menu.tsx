import { Menu } from '@mantine/core'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { MenuItemProps } from '@mantine/core'
import { menuDropdown, menuItem, menuItemDanger } from '../styles.css'
import { vars } from '../vars.css'

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

export const ContextMenu = ({ x, y, onClose, children, opened = true }: ContextMenuProps) => (
  <Menu
    opened={opened}
    onChange={(next) => {
      if (!next) onClose()
    }}
    position="bottom-start"
    offset={2}
    zIndex={vars.z.overlay}
    classNames={{ dropdown: menuDropdown }}
  >
    <Menu.Target>
      <span style={anchorStyle(x, y)} />
    </Menu.Target>
    <Menu.Dropdown>{children}</Menu.Dropdown>
  </Menu>
)

export type ContextMenuItemProps = MenuItemProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
    icon?: ReactNode
    danger?: boolean
  }

export const ContextMenuItem = ({
  icon,
  danger,
  className,
  children,
  ...rest
}: ContextMenuItemProps) => (
  <Menu.Item
    leftSection={icon}
    className={[menuItem, danger ? menuItemDanger : '', className ?? '']
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {children}
  </Menu.Item>
)
