import { createVar, style, fallbackVar } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { vars } from './vars.css'

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space.s8,
    border: 0,
    borderRadius: vars.radius.md,
    fontSize: vars.fs.bodySm,
    fontWeight: vars.fw.medium,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: `background ${vars.motion.base}`,
    selectors: {
      '&:active': { filter: 'brightness(0.96)' },
      '&:disabled': { opacity: 0.45, cursor: 'not-allowed' },
    },
  },
  variants: {
    variant: {
      primary: {
        background: vars.color.accent,
        color: vars.color.bg,
        selectors: {
          '&:hover:not(:disabled)': { background: vars.color.accentPressed },
        },
      },
      secondary: {
        background: vars.color.surface1,
        color: vars.color.text,
        border: `1px solid ${vars.color.border}`,
        selectors: {
          '&:hover:not(:disabled)': { background: vars.color.surface2 },
        },
      },
      ghost: {
        background: 'transparent',
        color: vars.color.textMuted,
        selectors: {
          '&:hover:not(:disabled)': {
            background: vars.color.surface1,
            color: vars.color.text,
          },
        },
      },
      danger: {
        background: vars.color.danger,
        color: vars.color.bg,
      },
    },
    size: {
      sm: { height: vars.size.buttonSm, padding: `0 ${vars.space.s12}` },
      md: { height: vars.size.buttonMd, padding: `0 ${vars.space.s16}` },
      lg: {
        height: vars.size.buttonLg,
        padding: `0 ${vars.space.s24}`,
        fontSize: vars.fs.body,
      },
    },
    selected: {
      true: { background: vars.color.accentSoft, color: vars.color.accent },
    },
    loading: {
      true: { opacity: 0.6, pointerEvents: 'none' },
    },
  },
  defaultVariants: { variant: 'secondary', size: 'md' },
})

export const iconButton = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: vars.size.tapMin,
    minHeight: vars.size.tapMin,
    border: 0,
    borderRadius: vars.radius.md,
    background: 'transparent',
    color: vars.color.textMuted,
    cursor: 'pointer',
    selectors: {
      '&:hover:not(:disabled)': {
        background: vars.color.surface1,
        color: vars.color.text,
      },
      '&:disabled': { opacity: 0.45, cursor: 'not-allowed' },
    },
  },
})

export const statusChip = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space.s4,
    minHeight: vars.space.s24,
    padding: `0 ${vars.space.s8}`,
    borderRadius: vars.radius.full,
    fontSize: vars.fs.label,
    fontWeight: vars.fw.medium,
  },
  variants: {
    tone: {
      ready: { background: vars.color.accentSoft, color: vars.color.accent },
      running: { background: vars.color.accentSoft, color: vars.color.accent },
      verified: { background: vars.color.surface1, color: vars.color.success },
      pending: { background: vars.color.surface1, color: vars.color.warn },
      error: { background: vars.color.surface1, color: vars.color.danger },
    },
  },
})

export const skeletonHeight = createVar()

export const skeleton = style({
  borderRadius: vars.radius.md,
  background: vars.color.surface2,
  minHeight: vars.space.s16,
  height: fallbackVar(skeletonHeight, '16px'),
})

export const menuX = createVar()
export const menuY = createVar()
