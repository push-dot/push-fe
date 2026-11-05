import type { ReactNode } from 'react'
import { Platform, View, type ViewStyle } from 'react-native'
import { Glass } from '../../../shared/components'

const Plain = ({ style, children }: { style: ViewStyle; children: ReactNode }) => <View style={style}>{children}</View>

const Surface = Platform.OS === 'ios' ? Glass : Plain

export default Surface
