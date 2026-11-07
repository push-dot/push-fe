import { Box, DropdownMenu, DropdownMenuItem, HorizontalDivider, RNHostView, Text } from '@expo/ui/jetpack-compose'
import { Fragment } from 'react'
import { fillMaxSize } from '@expo/ui/jetpack-compose/modifiers'
import { StyleSheet, View } from 'react-native'
import { radius, useColors } from '../../theme'
import Icon from './icon'
import { menuSections, type MenuAction, type MenuSection } from './menu-action'
import NativeHost from './native-host'

type Props = { actions: MenuAction[] | MenuSection[]; open: boolean; onClose: () => void; children: React.ReactElement }

/** Android: Material 3 dropdown anchored over its trigger; the overlay passes touches to the trigger. */
const MenuAnchor = ({ actions, open, onClose, children }: Props) => {
  const c = useColors()
  return (
    <View>
      {children}
      <NativeHost pointerEvents="none" style={StyleSheet.absoluteFill}>
        <DropdownMenu expanded={open} onDismissRequest={onClose} color={c.card} cornerRadius={radius.lg}>
          <DropdownMenu.Trigger>
            <Box modifiers={[fillMaxSize()]} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            {menuSections(actions).map((s, si) => (
              <Fragment key={s.key}>
                {si > 0 ? <HorizontalDivider color={c.line} /> : null}
                {s.title ? (
                  <DropdownMenuItem enabled={false} elementColors={{ disabledTextColor: c.t3 }}>
                    <DropdownMenuItem.Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{s.title}</Text>
                    </DropdownMenuItem.Text>
                  </DropdownMenuItem>
                ) : null}
                {s.actions.map((a, i) => {
                  const ink = a.destructive ? c.red : c.t1
                  return (
                    <Fragment key={a.key}>
                      {a.destructive && i > 0 && !s.actions[i - 1]!.destructive ? <HorizontalDivider color={c.line} /> : null}
                      <DropdownMenuItem onClick={() => (onClose(), a.onPress())} elementColors={{ textColor: ink }}>
                        {a.icon ? (
                          <DropdownMenuItem.LeadingIcon>
                            <RNHostView matchContents>
                              <Icon name={a.icon} size={20} color={ink} />
                            </RNHostView>
                          </DropdownMenuItem.LeadingIcon>
                        ) : null}
                        <DropdownMenuItem.Text>
                          <Text style={a.selected ? { fontWeight: 'bold' } : undefined}>{a.label}</Text>
                        </DropdownMenuItem.Text>
                        {a.selected ? (
                          <DropdownMenuItem.TrailingIcon>
                            <RNHostView matchContents>
                              <Icon name="check" size={18} color="acText" />
                            </RNHostView>
                          </DropdownMenuItem.TrailingIcon>
                        ) : null}
                      </DropdownMenuItem>
                    </Fragment>
                  )
                })}
              </Fragment>
            ))}
          </DropdownMenu.Items>
        </DropdownMenu>
      </NativeHost>
    </View>
  )
}

export default MenuAnchor
