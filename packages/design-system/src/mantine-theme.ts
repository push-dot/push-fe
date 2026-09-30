import { createTheme } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'
import { palette } from './palette'
import { vars } from './vars.css'

const pushAccent: MantineColorsTuple = [
  palette.blue50,
  '#e2ecff',
  '#c9d9ff',
  '#a9c1ff',
  palette.blue400,
  palette.blue500,
  palette.blue600,
  palette.blue700,
  '#1a3fb0',
  '#15348f',
]

const pushDanger: MantineColorsTuple = [
  '#fff0f0',
  '#ffe0e0',
  '#ffc4c4',
  '#ff9f9f',
  palette.red400,
  '#f05252',
  palette.red600,
  '#c41e1e',
  '#a91818',
  '#8c1414',
]

export const pushMantineTheme = createTheme({
  fontFamily: vars.font.family,
  fontFamilyMonospace: vars.font.mono,
  primaryColor: 'pushAccent',
  primaryShade: 6,
  defaultRadius: 'md',
  colors: {
    pushAccent,
    pushDanger,
  },
  fontSizes: {
    xs: vars.fs.caption,
    sm: vars.fs.bodySm,
    md: vars.fs.body,
    lg: vars.fs.h3,
    xl: vars.fs.h2,
  },
  spacing: {
    xs: vars.space.s4,
    sm: vars.space.s8,
    md: vars.space.s16,
    lg: vars.space.s24,
    xl: vars.space.s32,
  },
  radius: {
    xs: vars.radius.sm,
    sm: vars.radius.sm,
    md: vars.radius.md,
    lg: vars.radius.lg,
    xl: vars.radius.xl,
  },
  headings: {
    sizes: {
      h1: { fontSize: vars.fs.h1, fontWeight: vars.fw.semi },
      h2: { fontSize: vars.fs.h2, fontWeight: vars.fw.semi },
      h3: { fontSize: vars.fs.h3, fontWeight: vars.fw.semi },
    },
  },
})
