import type { ReactNode } from 'react'
import { Platform } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

// The boards draw an Android page sheet from 14pt under the top edge with its header centred at 52pt, status bar included.
// Every header reads insets.top + 28, so a top inset of 24 puts it there.
const MODAL_TOP_INSET = 24
// 서류 보기 pushed from the Push 서류 modal keeps the sheet's header; opened from the tabs it is a normal screen.
const PAGE_IN_MODAL = 'docs/push/[id]'
const MODAL_ROUTES = ['docs/push/index', 'sidebar/account', 'sidebar/docs', 'sidebar/links', 'sidebar/bookmarks', 'sidebar/conversations']

type ScreenProps = {
  route: { name: string }
  navigation: { getState: () => { routes: { name: string }[] } }
  options: { presentation?: string }
  children: ReactNode
}

/** Gives an Android page-sheet route the sheet's top inset instead of the status bar's. Other routes and iOS pass through. */
export const modalInsets = ({ route, navigation, options, children }: ScreenProps) => {
  const inModal =
    (options.presentation === 'modal' && MODAL_ROUTES.includes(route.name)) ||
    (route.name === PAGE_IN_MODAL && navigation.getState().routes.some((r) => r.name === 'docs/push/index'))
  return Platform.OS === 'android' && inModal ? <ModalInsets>{children}</ModalInsets> : <>{children}</>
}

const ModalInsets = ({ children }: { children: ReactNode }) => (
  <SafeAreaInsetsContext.Consumer>
    {(insets) => (insets ? <SafeAreaInsetsContext.Provider value={{ ...insets, top: MODAL_TOP_INSET }}>{children}</SafeAreaInsetsContext.Provider> : children)}
  </SafeAreaInsetsContext.Consumer>
)
