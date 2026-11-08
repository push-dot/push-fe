import type { ReactNode } from 'react'
import { Platform } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

// The boards draw an Android page sheet from 14pt under the top edge with its header centred at 52pt, status bar included.
// Every header reads insets.top + 28, so a top inset of 24 puts it there.
const MODAL_TOP_INSET = 24
const MODAL_ROUTES = ['docs/push/index', 'sidebar/account', 'sidebar/docs', 'sidebar/links', 'sidebar/bookmarks', 'sidebar/conversations']

/** Gives an Android page-sheet route the sheet's top inset instead of the status bar's. Other routes and iOS pass through. */
export const modalInsets = ({ route, options, children }: { route: { name: string }; options: { presentation?: string }; children: ReactNode }) =>
  Platform.OS === 'android' && options.presentation === 'modal' && MODAL_ROUTES.includes(route.name) ? <ModalInsets>{children}</ModalInsets> : <>{children}</>

const ModalInsets = ({ children }: { children: ReactNode }) => (
  <SafeAreaInsetsContext.Consumer>
    {(insets) => (insets ? <SafeAreaInsetsContext.Provider value={{ ...insets, top: MODAL_TOP_INSET }}>{children}</SafeAreaInsetsContext.Provider> : children)}
  </SafeAreaInsetsContext.Consumer>
)
