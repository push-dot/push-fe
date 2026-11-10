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
    redFill: '#C9302C',
    paper: '#FFFFFF',
    deco: '#B4BAC2',
    headerGlass: 'rgba(255,255,255,.88)',
    bookmarkGlass: 'rgba(255,255,255,.9)',
    ctl: '#848C96',
    popWeb: '0 12px 40px rgba(16,24,40,.14),0 0 0 1px rgba(16,24,40,.05)',
    toastBg: '#16191D',
    toastText: '#FFFFFF',
    toastShadow: '0 12px 30px rgba(0,0,0,.2)',
    notifStage: '#0E9F55',
    notifOffer: '#5B4CF0',
    notifComment: '#0C8093',
    notifDeadline: '#E5484D',
    notifAi: '#7C5CFF',
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
    redFill: '#C9302C',
    paper: '#24272C',
    deco: '#5C636C',
    headerGlass: 'rgba(15,16,18,.86)',
    bookmarkGlass: 'rgba(28,30,34,.9)',
    ctl: '#6E7680',
    popWeb: '0 16px 48px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08)',
    toastBg: '#2E3238',
    toastText: '#F3F4F6',
    toastShadow: '0 12px 30px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08)',
    notifStage: '#0E9F55',
    notifOffer: '#5B4CF0',
    notifComment: '#0C8093',
    notifDeadline: '#E5484D',
    notifAi: '#7C5CFF',
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
  segLabel: { family: 'sans', fontSize: 15, lineHeight: 22, fontWeight: 600, letterSpacing: -0.02 },
  mono: { family: 'mono', fontSize: 12.5, lineHeight: 19, fontWeight: 400, letterSpacing: -0.02 },
} as const

export const largeText = {
  h1: { fontSize: 34, lineHeight: 44 },
  h2: { fontSize: 26, lineHeight: 34 },
  h3: { fontSize: 22, lineHeight: 30 },
  b1: { fontSize: 21, lineHeight: 30 },
  b2: { fontSize: 20, lineHeight: 28 },
  c1: { fontSize: 17, lineHeight: 24 },
  c2: { fontSize: 16, lineHeight: 22 },
} as const

export const fontWeights = { w6: 600, w7: 700 } as const

export const fontFamily = {
  sans: '"Noto Sans KR", "Noto Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const

export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 } as const

export const radius = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
  card: 20,
  buttonAndroid: 16,
  buttonIos: 28,
  buttonSmAndroid: 12,
  buttonSmIos: 20,
  chip: 17,
  confirmPanelTop: 24,
  sheetTop: 28,
  phoneIos: 54,
  phoneAndroid: 40,
} as const

export const shadows = {
  light: {
    pop: '0 8px 28px rgba(22,25,29,.10)',
    glass:
      '0 6px 24px rgba(0,0,0,.10),0 0 0 .5px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.95)',
    icon: '0 6px 10px rgba(0,0,0,.18)',
    panel: '0 -4px 30px rgba(0,0,0,.12)',
  },
  dark: {
    pop: '0 8px 28px rgba(0,0,0,.5)',
    glass:
      '0 6px 24px rgba(0,0,0,.5),0 0 0 .5px rgba(255,255,255,.12),inset 0 1px 0 rgba(255,255,255,.16)',
    icon: '0 6px 10px rgba(0,0,0,.18)',
    panel: '0 -4px 30px rgba(0,0,0,.12)',
  },
} as const

export const platform = {
  ios: { safeTop: 54, safeBottom: 34, tabBarHeight: 94 },
  android: { safeTop: 40, safeBottom: 20, tabBarHeight: 78 },
} as const

export const tile = {
  navy: '#1F3A8A',
  indigo: '#3B5BDB',
  indigoDeep: '#364FC7',
  blue: '#1971C2',
  blueDeep: '#1864AB',
  sky: '#1C7ED6',
  cyan: '#0C8599',
  green: '#2F9E44',
  greenDeep: '#2B8A3E',
  amber: '#E67700',
  orange: '#E8590C',
  violet: '#5F3DC4',
  grape: '#862E9C',
  pink: '#D6336C',
  rose: '#C2255C',
  slate: '#343A40',
  github: '#24292F',
} as const

export const glow = { ac: '#6C5CF5', orange: '#FF8A2A', green: '#12A866' } as const

export const photo = {
  ink: 'rgba(255,255,255,.92)',
  button: 'rgba(255,255,255,.86)',
  shade: 'rgba(0,0,0,.28)',
} as const

export const toast = { androidAction: '#B3AAFF' } as const
