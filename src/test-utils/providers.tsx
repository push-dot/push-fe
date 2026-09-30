import { DesignSystemProvider } from '@push/design-system'
import type { ReactNode } from 'react'

export const TestProviders = ({ children }: { children: ReactNode }) => (
  <DesignSystemProvider colorScheme="light">{children}</DesignSystemProvider>
)
