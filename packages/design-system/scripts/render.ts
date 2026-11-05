import {
  BODY,
  LINE_INK,
  PREFIXES,
  PRINT_WIDTH,
  SHADOW_CSS_NAMES,
  SHORT_KEY,
  THEMES,
} from './constants.ts'

type Theme = (typeof THEMES)[number]
type Themed = Record<Theme, string>
type Named<V> = { name: string; value: V }
type Style = {
  name: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  letterSpacing?: string
}

export type DesignSystem = {
  color: { tokens: Named<Themed>[] }
  type: { families: Record<string, string>; groups: { family: string; styles: Style[] }[] }
  spacing: { tokens: Named<string>[] }
  radius: { tokens: Named<string>[] }
  shadow: { tokens: Named<Themed>[] }
}

export type Canvas = { color: Record<string, Partial<Themed>>; letterSpacing: string }

type Model = ReturnType<typeof buildTokens>

const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

const unit = (value: string) => Number.parseFloat(value)

const scale = (tokens: Named<string>[], prefix: string) =>
  Object.fromEntries(tokens.map((t) => [t.name.slice(prefix.length), unit(t.value)]))

const themeColors = (ds: DesignSystem, canvas: Canvas, theme: Theme) => ({
  ...Object.fromEntries(ds.color.tokens.map((t) => [camel(t.name), t.value[theme]])),
  ...Object.fromEntries(
    Object.entries(canvas.color).flatMap(([name, v]) => (v[theme] ? [[name, v[theme]]] : [])),
  ),
})

export const buildTokens = (ds: DesignSystem, canvas: Canvas) => {
  const [light, dark] = THEMES.map((theme) => themeColors(ds, canvas, theme))
  if (Object.keys(light).join() !== Object.keys(dark).join()) {
    throw new Error('Every colour needs both a light and a dark value')
  }
  const tracking = unit(canvas.letterSpacing)
  return {
    colors: { light, dark },
    typography: Object.fromEntries(
      ds.type.groups.flatMap((group) =>
        group.styles.map((s) => [
          s.name,
          {
            family: group.family,
            fontSize: unit(s.fontSize),
            lineHeight: unit(s.lineHeight),
            fontWeight: s.fontWeight,
            letterSpacing: s.letterSpacing ? unit(s.letterSpacing) : tracking,
          },
        ]),
      ),
    ),
    fontFamily: ds.type.families,
    spacing: scale(ds.spacing.tokens, PREFIXES.space),
    radius: scale(ds.radius.tokens, PREFIXES.radius),
    shadows: Object.fromEntries(
      THEMES.map((theme) => [
        theme,
        Object.fromEntries(
          ds.shadow.tokens.map((t) => [t.name.slice(PREFIXES.shadow.length), t.value[theme]]),
        ),
      ]),
    ),
    tracking,
  }
}

const key = (k: string) => (/^([A-Za-z_$][\w$]*|\d+)$/.test(k) ? k : `'${k}'`)

const text = (s: string) =>
  `'${s.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n')}'`

const literal = (value: unknown, indent: number, room: number): string => {
  if (typeof value === 'string') return text(value)
  if (typeof value === 'number') return String(value)
  const entries = Object.entries(value as object)
  const leaf = entries.every(([, v]) => typeof v !== 'object')
  const inline = `{ ${entries.map(([k, v]) => `${key(k)}: ${literal(v, 0, Infinity)}`).join(', ')} }`
  if (leaf && inline.length <= room) return inline
  const pad = '  '.repeat(indent + 1)
  const lines = entries.map(([k, v]) => {
    const head = `${pad}${key(k)}: `
    const body = literal(v, indent + 1, PRINT_WIDTH - head.length - 1)
    const wrap =
      typeof v === 'string' &&
      key(k).length >= SHORT_KEY &&
      head.length + body.length >= PRINT_WIDTH
    return wrap ? `${pad}${key(k)}:\n${pad}  ${body},` : `${head}${body},`
  })
  return `{\n${lines.join('\n')}\n${'  '.repeat(indent)}}`
}

const declare = (name: string, value: unknown, suffix = ' as const') => {
  const head = `export const ${name} = `
  return `${head}${literal(value, 0, PRINT_WIDTH - head.length - suffix.length)}${suffix}\n`
}

export const renderTokens = (m: Model) =>
  [
    declare('colors', m.colors),
    declare('typography', m.typography),
    declare('fontFamily', m.fontFamily),
    declare('spacing', m.spacing),
    declare('radius', m.radius),
    declare('shadows', m.shadows),
  ].join('\n')

const vars = (entries: [string, string][]) => entries.map(([k, v]) => `--${k}:${v}`).join(';')

const themeVars = (m: Model, theme: Theme) =>
  [
    vars(Object.entries(m.colors[theme])),
    vars(Object.entries(m.shadows[theme] ?? {}).map(([k, v]) => [SHADOW_CSS_NAMES[k] ?? k, v])),
    `color-scheme:${theme}`,
  ].join(';')

const scaleVars = (m: Model) =>
  vars([
    ...Object.entries(m.spacing).map(([k, v]): [string, string] => [`sp${k}`, `${v}px`]),
    ...Object.entries(m.radius).map(([k, v]): [string, string] => [`r-${k}`, `${v}px`]),
    ...Object.entries(m.fontFamily).map(([k, v]): [string, string] => [`font-${k}`, v]),
  ])

const typeClass = (m: Model, [name, s]: [string, Model['typography'][string]]) => {
  const rules = [
    `font-size:${s.fontSize}px`,
    `line-height:${s.lineHeight}px`,
    s.fontWeight !== BODY.fontWeight && `font-weight:${s.fontWeight}`,
    s.letterSpacing !== m.tracking && `letter-spacing:${s.letterSpacing}em`,
    s.family !== BODY.family && `font-family:var(--font-${s.family})`,
  ]
  return `.${name}{${rules.filter(Boolean).join(';')}}`
}

export const renderCss = (m: Model) =>
  [
    `:root,[data-theme=light]{${themeVars(m, 'light')}}`,
    `[data-theme=dark]{${themeVars(m, 'dark')}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme=light]){${themeVars(m, 'dark')}}}`,
    `:root{${scaleVars(m)}}`,
    ...Object.entries(m.typography).map((entry) => typeClass(m, entry)),
    '',
  ].join('\n')

const bare = (svg: string) =>
  svg
    .trim()
    .replace(/^<svg[^>]*>/, (tag) => tag.replace(/ (width|height|aria-hidden)="[^"]*"/g, ''))

const mapValues = (o: Record<string, string>, f: (v: string) => string) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]))

export const renderIcons = (icons: Record<string, string>, icons3d: Record<string, string>) =>
  [
    declare(
      'LINE_ICONS',
      mapValues(icons, (svg) => bare(svg).replaceAll(LINE_INK, 'stroke="currentColor"')),
      '',
    ),
    declare('ICONS_3D', mapValues(icons3d, bare), ''),
    'export type IconName = keyof typeof LINE_ICONS\nexport type Icon3DName = keyof typeof ICONS_3D\n',
  ].join('\n')
