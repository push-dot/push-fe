import type { MenuItemProps } from '@mantine/core'
import { Menu } from '@mantine/core'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { menuItem, menuItemDanger } from '../styles.css'

export type ContextMenuItemProps = MenuItemProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
    icon?: ReactNode
    danger?: boolean
  }

const ContextMenuItem = ({ icon, danger, className, children, ...rest }: ContextMenuItemProps) => (
  <Menu.Item
    leftSection={icon}
    className={[menuItem, danger ? menuItemDanger : '', className ?? ''].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Menu.Item>
)

export default ContextMenuItem
