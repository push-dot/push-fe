import { MantineProvider } from '@mantine/core'
import type { ReactNode } from 'react'
import { pushMantineTheme } from './mantine-theme'

export type DesignSystemProviderProps = {
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}

export const DesignSystemProvider = ({
  colorScheme = 'light',
  children,
}: DesignSystemProviderProps) => (
  <MantineProvider theme={pushMantineTheme} forceColorScheme={colorScheme}>
    {children}
  </MantineProvider>
)
