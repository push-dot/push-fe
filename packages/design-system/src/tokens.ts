export const colors = {
  light: {
    bg: '#FFFFFF',
    bg2: '#F4F5F7',
    card: '#FFFFFF',
    fill: '#F2F3F5',
    fill2: '#E9EBEE',
    line: '#EBEDF0',
    t1: '#16191D',
    t2: '#4B525C',
    t3: '#646B75',
    t4: '#646B75',
    ac: '#5B4CF0',
    acSoft: '#EFEDFF',
    acText: '#4A3BDF',
    green: '#087A3E',
    greenSoft: '#E6F6EE',
    red: '#C9302C',
    redSoft: '#FDEEEE',
    orange: '#AD4E00',
    orangeSoft: '#FFF2E6',
    scrim: 'rgba(0,0,0,.4)',
    glass: 'rgba(255,255,255,.6)',
    sheet: 'rgba(250,250,252,.84)',
    acPress: '#4A3BDF',
    paper: '#FFFFFF',
    deco: '#B4BAC2',
  },
  dark: {
    bg: '#0F1012',
    bg2: '#17181B',
    card: '#1C1E22',
    fill: '#24272C',
    fill2: '#2E3238',
    line: '#2A2D33',
    t1: '#F3F4F6',
    t2: '#C2C7CE',
    t3: '#8C939C',
    t4: '#8C939C',
    ac: '#6B5BFA',
    acSoft: 'rgba(116,100,255,.18)',
    acText: '#A69CFF',
    green: '#3CCB7F',
    greenSoft: 'rgba(60,203,127,.14)',
    red: '#FF6B6F',
    redSoft: 'rgba(255,107,111,.14)',
    orange: '#FF9A3D',
    orangeSoft: 'rgba(255,154,61,.14)',
    scrim: 'rgba(0,0,0,.6)',
    glass: 'rgba(44,46,52,.58)',
    sheet: 'rgba(32,34,38,.86)',
    acPress: '#5E4FEA',
    paper: '#24272C',
    deco: '#5C636C',
  },
} as const

export const typography = {
  h1: { family: 'sans', fontSize: 26, lineHeight: 36, fontWeight: 800, letterSpacing: -0.03 },
  h2: { family: 'sans', fontSize: 20, lineHeight: 28, fontWeight: 700, letterSpacing: -0.025 },
  h3: { family: 'sans', fontSize: 17, lineHeight: 24, fontWeight: 700, letterSpacing: -0.02 },
  b1: { family: 'sans', fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: -0.02 },
  b2: { family: 'sans', fontSize: 15, lineHeight: 22, fontWeight: 400, letterSpacing: -0.02 },
  c1: { family: 'sans', fontSize: 13, lineHeight: 18, fontWeight: 400, letterSpacing: -0.02 },
  c2: { family: 'sans', fontSize: 12, lineHeight: 16, fontWeight: 400, letterSpacing: -0.02 },
  button: { family: 'sans', fontSize: 17, lineHeight: 24, fontWeight: 700, letterSpacing: -0.02 },
  tab: { family: 'sans', fontSize: 11, lineHeight: 14, fontWeight: 600, letterSpacing: -0.02 },
  mono: { family: 'mono', fontSize: 12.5, lineHeight: 19, fontWeight: 400, letterSpacing: -0.02 },
} as const

export const fontFamily = {
  sans: '"Noto Sans KR", "Noto Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const

export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 } as const

export const radius = { xs: 6, sm: 12, md: 16, lg: 20, xl: 28, pill: 999 } as const

export const shadows = {
  light: {
    pop: '0 8px 28px rgba(22,25,29,.10)',
    glass:
      '0 6px 24px rgba(0,0,0,.10), 0 0 0 .5px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.95)',
  },
  dark: {
    pop: '0 8px 28px rgba(0,0,0,.5)',
    glass:
      '0 6px 24px rgba(0,0,0,.5), 0 0 0 .5px rgba(255,255,255,.12), inset 0 1px 0 rgba(255,255,255,.16)',
  },
} as const
