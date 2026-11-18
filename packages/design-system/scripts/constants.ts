export const THEMES = ['light', 'dark'] as const

export const SHADOW_CSS_NAMES: Record<string, string> = { pop: 'shadow', glass: 'glassShadow' }

export const LINE_INK = 'stroke="#16191D"'

export const PRINT_WIDTH = 100

export const SHORT_KEY = 5

export const SOURCES = {
  designSystem: 'tokens/design-system.json',
  app: 'tokens/push-app.json',
  artboard: 'tokens/artboard.json',
  icons: 'assets/icons',
  icons3d: 'assets/icons-3d',
  brand: 'assets/brand',
}

export const OUTPUTS = {
  tokens: 'src/tokens.ts',
  css: 'src/tokens.css',
  icons: 'src/icons.ts',
}

export const PREFIXES = { space: 'space-', radius: 'radius-', shadow: 'shadow-' }

export const BODY = { family: 'sans', fontWeight: 400 }
