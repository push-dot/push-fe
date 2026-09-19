import { createGlobalTheme, globalStyle } from '@vanilla-extract/css'
import { vars } from './vars.css'

const shared = {
  space: {
    s4: '4px',
    s8: '8px',
    s12: '12px',
    s16: '16px',
    s24: '24px',
    s32: '32px',
    s48: '48px',
    screenPadding: '24px',
    section: '24px',
    cardPadding: '16px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  size: {
    buttonSm: '36px',
    buttonMd: '44px',
    buttonLg: '52px',
    icon16: '16px',
    icon20: '20px',
    icon24: '24px',
    tapMin: '44px',
    sidebar: '220px',
    sidebarRow: '36px',
    canvasHeader: '64px',
    dialogW: '480px',
    dot: '8px',
  },
  z: {
    base: '0',
    sticky: '100',
    sidebar: '200',
    overlay: '300',
    dialog: '500',
    toast: '600',
  },
  font: {
    family: "'Pretendard', -apple-system, 'Apple SD Gothic Neo', system-ui, sans-serif",
    mono: "ui-monospace, 'SF Mono', Menlo, monospace",
  },
  fs: {
    display: '28px',
    h1: '24px',
    h2: '20px',
    h3: '17px',
    body: '15px',
    bodySm: '14px',
    caption: '12px',
    label: '13px',
  },
  fw: {
    bold: '700',
    semi: '600',
    medium: '500',
    regular: '400',
  },
  frame: {
    w: '1440px',
    h: '900px',
  },
  window: {
    minW: '1024px',
    minH: '640px',
  },
  motion: {
    base: '200ms ease-out',
    dialog: '250ms ease-out',
  },
}

createGlobalTheme(':root', vars, {
  ...shared,
  color: {
    bg: '#ffffff',
    surface1: '#f5f5f7',
    surface2: '#e9e9ee',
    text: '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    accent: '#2563eb',
    accentPressed: '#1d4ed8',
    accentSoft: 'rgba(37, 99, 235, 0.1)',
    danger: '#dc2626',
    success: '#166534',
    warn: '#b45309',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
})

createGlobalTheme(':root[data-theme="dark"]', vars, {
  ...shared,
  color: {
    bg: '#101114',
    surface1: '#17181d',
    surface2: '#212329',
    text: '#e7e9ee',
    textMuted: '#8b909c',
    border: '#2a2d35',
    accent: '#5b8def',
    accentPressed: '#4477d9',
    accentSoft: 'rgba(91, 141, 239, 0.16)',
    danger: '#f26d6d',
    success: '#4ade80',
    warn: '#f5b04c',
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 16px rgba(0, 0, 0, 0.5)',
  },
})

globalStyle(':root[data-theme="dark"]', {
  colorScheme: 'dark',
})

globalStyle('body', {
  fontFamily: vars.font.family,
  color: vars.color.text,
  background: vars.color.bg,
})

globalStyle('.t-display', {
  fontSize: vars.fs.display,
  fontWeight: vars.fw.bold,
  lineHeight: 1.3,
})

globalStyle('.t-h1', {
  fontSize: vars.fs.h1,
  fontWeight: vars.fw.semi,
  lineHeight: 1.3,
})

globalStyle('.t-h2', {
  fontSize: vars.fs.h2,
  fontWeight: vars.fw.semi,
  lineHeight: 1.3,
})

globalStyle('.t-h3', {
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
  lineHeight: 1.3,
})

globalStyle('.t-body', {
  fontSize: vars.fs.body,
  fontWeight: vars.fw.regular,
  lineHeight: 1.5,
})

globalStyle('.t-body-sm', {
  fontSize: vars.fs.bodySm,
  fontWeight: vars.fw.regular,
  lineHeight: 1.5,
})

globalStyle('.t-caption', {
  fontSize: vars.fs.caption,
  fontWeight: vars.fw.regular,
  lineHeight: 1.5,
})

globalStyle('.t-label', {
  fontSize: vars.fs.label,
  fontWeight: vars.fw.medium,
  lineHeight: 1.5,
})
