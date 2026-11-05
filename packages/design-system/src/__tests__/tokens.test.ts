import { describe, expect, it } from 'vitest'
import { outputs, readSource } from '../../scripts/sources.ts'
import { ICONS_3D, LINE_ICONS } from '../icons'
import { colors, fontFamily, radius, shadows, spacing, typography } from '../tokens'

const designSystem = JSON.parse(readSource('tokens/design-system.json'))
const canvas = JSON.parse(readSource('tokens/canvas.json'))
const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
const byName = (theme: 'light' | 'dark') => colors[theme] as Record<string, string>

describe('generated files', () => {
  it.each(Object.entries(outputs()))('%s is up to date with the sources', (path, content) => {
    expect(readSource(path)).toBe(content)
  })
})

describe('colors', () => {
  it.each(['light', 'dark'] as const)('keep every design system colour in %s', (theme) => {
    for (const token of designSystem.color.tokens) {
      const name = camel(token.name)
      expect(byName(theme)[name]).toBe(canvas.color[name]?.[theme] ?? token.value[theme])
    }
  })

  it('let the app canvas win over the design system', () => {
    expect(colors.light.t3).toBe('#646B75')
    expect(colors.light.red).toBe('#C9302C')
    expect(colors.dark.ac).toBe('#6B5BFA')
    expect(colors.dark.t4).toBe('#8C939C')
  })

  it('add the canvas-only colours to both themes', () => {
    expect(colors.light.deco).toBe('#B4BAC2')
    expect(colors.dark.deco).toBe('#5C636C')
    expect(Object.keys(colors.dark)).toEqual(Object.keys(colors.light))
  })
})

describe('scales', () => {
  it('turn spacing and radius into pixel numbers', () => {
    expect(spacing).toEqual({ 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 })
    expect(radius).toEqual({ xs: 6, sm: 12, md: 16, lg: 20, xl: 28, pill: 999 })
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
    expect(shadows.dark.glass).toBe(designSystem.shadow.tokens[1].value.dark)
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
    expect(Object.keys(LINE_ICONS)).toHaveLength(38)
    expect(Object.keys(ICONS_3D)).toHaveLength(13)
  })

  it('draw line icons in the current text colour at any size', () => {
    expect(LINE_ICONS.back).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5 7.5 12l7.5 7.5"></path></svg>',
    )
    expect(
      ICONS_3D.star.startsWith(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs>',
      ),
    ).toBe(true)
  })
})
