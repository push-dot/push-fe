import type { Preview } from '@storybook/react-vite'
import '@mantine/core/styles.css'
import '../src/theme.css'
import { DesignSystemProvider } from '../src/design-system-provider'

const preview: Preview = {
  globalTypes: {
    scheme: {
      description: 'Light/dark theme',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  initialGlobals: { scheme: 'light' },
  decorators: [
    (Story, context) => {
      const scheme = context.globals.scheme === 'dark' ? 'dark' : 'light'
      document.documentElement.dataset.theme = scheme
      return (
        <DesignSystemProvider colorScheme={scheme}>
          <Story />
        </DesignSystemProvider>
      )
    },
  ],
  parameters: {
    controls: { expanded: true },
    backgrounds: { default: 'surface' },
  },
}

export default preview
