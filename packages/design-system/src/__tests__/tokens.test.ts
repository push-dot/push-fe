import { describe, expect, it } from 'vitest'
import { outputs, readSource } from '../../scripts/sources.ts'
import { BRAND, ICONS_3D, LINE_ICONS } from '../icons'
import {
  colors,
  fontFamily,
  fontWeights,
  largeText,
  glow,
  photo,
  platform,
  radius,
  shadows,
  spacing,
  tile,
  typography,
} from '../tokens'

const designSystem = JSON.parse(readSource('tokens/design-system.json'))
const app = JSON.parse(readSource('tokens/push-app.json'))
const artboard = JSON.parse(readSource('tokens/artboard.json'))
const px = (v: string) => Number.parseFloat(v)
const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
const byName = (theme: 'light' | 'dark') => colors[theme] as Record<string, string>

describe('generated files', () => {
  it.each(Object.entries(outputs()))('%s is up to date with the sources', (path, content) => {
    expect(readSource(path)).toBe(content)
  })
})

describe('colors', () => {
  it.each(['light', 'dark'] as const)('equal the app handoff in %s', (theme) => {
    const { shadow, glassShadow, ...flat } = app.color[theme]
    expect(byName(theme)).toEqual(flat)
    expect(shadows[theme]).toEqual({ pop: shadow, glass: glassShadow, ...artboard.shadow })
  })

  it.each(['light', 'dark'] as const)('keep every design system colour name in %s', (theme) => {
    for (const token of designSystem.color.tokens) expect(byName(theme)).toHaveProperty(camel(token.name))
  })

  it('let the app handoff win over the design system', () => {
    expect(colors.light.t3).toBe('#646B75')
    expect(colors.light.red).toBe('#C9302C')
    expect(colors.dark.ac).toBe('#6B5BFA')
    expect(colors.dark.t4).toBe('#8C939C')
  })

  it('add the app-only colours to both themes', () => {
    expect(colors.light.deco).toBe('#B4BAC2')
    expect(colors.dark.deco).toBe('#5C636C')
    expect(Object.keys(colors.dark)).toEqual(Object.keys(colors.light))
  })
})

describe('artboard colours', () => {
  it('give avatar tiles and shortcut glows one name each', () => {
    expect(tile).toEqual(artboard.tile)
    expect(glow).toEqual(artboard.glow)
    expect(photo).toEqual(artboard.photo)
    expect(tile.indigo).toBe('#3B5BDB')
  })
})

describe('scales', () => {
  it('turn spacing and radius into pixel numbers', () => {
    expect(spacing).toEqual({ 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 })
    expect(radius).toMatchObject({ xs: 6, sm: 12, md: 16, lg: 20, xl: 28, pill: 999 })
  })

  it('add the app radii, large text, weights and platform insets from the handoff', () => {
    for (const [name, value] of Object.entries(app.radius as Record<string, string>)) {
      expect(radius[camel(name) as keyof typeof radius]).toBe(px(value))
    }
    expect(radius.buttonIos).toBe(28)
    expect(radius.buttonAndroid).toBe(16)
    for (const [name, s] of Object.entries(app.typography.largeText as Record<string, { size: number; line: number }>)) {
      expect(largeText[name as keyof typeof largeText]).toEqual({ fontSize: s.size, lineHeight: s.line })
    }
    expect(fontWeights).toEqual(app.typography.weights)
    expect(platform).toEqual({
      ios: { safeTop: 54, safeBottom: 34, tabBarHeight: 94 },
      android: { safeTop: 40, safeBottom: 20, tabBarHeight: 78 },
    })
  })

  it('give every type style a size, line height, weight and tracking in em', () => {
    expect(typography.h1).toEqual({
      family: 'sans',
      fontSize: 26,
      lineHeight: 36,
      fontWeight: 800,
      letterSpacing: -0.03,
    })
    expect(typography.h3.letterSpacing).toBe(-0.02)
    expect(typography.mono).toEqual({
      family: 'mono',
      fontSize: 12.5,
      lineHeight: 19,
      fontWeight: 400,
      letterSpacing: -0.02,
    })
    expect(fontFamily.sans).toBe(designSystem.type.families.sans)
  })

  it('keep both shadows per theme as CSS', () => {
    expect(shadows.light.pop).toBe('0 8px 28px rgba(22,25,29,.10)')
    expect(shadows.dark.glass).toBe(app.color.dark.glassShadow)
  })
})

describe('css', () => {
  const css = readSource('src/tokens.css')

  it('declares light on :root and dark for data-theme and the system setting', () => {
    expect(css).toContain(':root,[data-theme=light]{--bg:#FFFFFF;')
    expect(css).toContain('[data-theme=dark]{--bg:#0F1012;')
    expect(css).toContain(
      '@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0F1012;',
    )
  })

  it('uses the canvas variable names for shadows', () => {
    expect(css).toContain('--shadow:0 8px 28px rgba(22,25,29,.10)')
    expect(css).toContain('--glassShadow:0 6px 24px rgba(0,0,0,.10)')
  })

  it('writes type classes like the canvas', () => {
    expect(css).toContain(
      '.h1{font-size:26px;line-height:36px;font-weight:800;letter-spacing:-0.03em}',
    )
    expect(css).toContain('.h3{font-size:17px;line-height:24px;font-weight:700}')
    expect(css).toContain('.b1{font-size:16px;line-height:24px}')
  })
})

describe('icons', () => {
  it('register every svg file by name', () => {
    expect(Object.keys(LINE_ICONS)).toHaveLength(61)
    expect(Object.keys(ICONS_3D)).toHaveLength(32)
    expect(Object.keys(BRAND)).toEqual(['push-mascot-on-dark', 'push-mascot-on-light'])
  })

  it('draw line icons in the current text colour at any size', () => {
    for (const svg of Object.values(LINE_ICONS)) {
      expect(svg).toContain('currentColor')
      expect(svg).not.toMatch(/ (width|height|style)="/)
    }
    expect(LINE_ICONS.back).toContain('<path d="M15 4.5 7.5 12l7.5 7.5"></path>')
    expect(LINE_ICONS.back).toContain('stroke-width="2.2"')
  })

  it('keep colour icons and the mascot sizeless', () => {
    for (const svg of [...Object.values(ICONS_3D), ...Object.values(BRAND)]) {
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox=')).toBe(true)
      expect(svg).not.toMatch(/^<svg[^>]* (width|height)="/)
    }
  })
})
