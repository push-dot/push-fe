import type { Preview } from '@storybook/react-vite'
import '../src/theme.css'

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: { default: 'surface' },
  },
}

export default preview
