import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { vars } from './vars.css'

export const input = recipe({
  base: {
    width: '100%',
    minHeight: vars.size.buttonMd,
    padding: `0 ${vars.space.s12}`,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    background: vars.color.bg,
    color: vars.color.text,
    fontSize: vars.fs.bodySm,
    selectors: {
      '&:focus': { outline: `2px solid ${vars.color.accent}`, outlineOffset: 0 },
      '&:disabled': {
        background: vars.color.surface1,
        color: vars.color.textMuted,
      },
    },
  },
  variants: {
    error: { true: { borderColor: vars.color.danger } },
    textarea: {
      true: {
        padding: `${vars.space.s12} ${vars.space.s12}`,
        resize: 'vertical',
        lineHeight: 1.5,
      },
    },
  },
})

export const formSelect = style({
  appearance: 'none',
  width: 'auto',
  minWidth: '200px',
  maxWidth: '240px',
  paddingRight: vars.space.s24,
  backgroundColor: vars.color.surface1,
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: `right ${vars.space.s8} center`,
  cursor: 'pointer',
  selectors: {
    '&:hover': { backgroundColor: vars.color.surface2 },
  },
})

export const card = recipe({
  base: {
    background: vars.color.surface1,
    borderRadius: vars.radius.lg,
    padding: vars.space.s16,
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space.s8,
    textAlign: 'left',
    border: '1px solid transparent',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
  },
  variants: {
    clickable: {
      true: {
        cursor: 'pointer',
        selectors: { '&:hover': { borderColor: vars.color.border } },
      },
    },
  },
})

export const cardTitle = style({
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
})

export const cardMeta = style({
  fontSize: vars.fs.caption,
  color: vars.color.textMuted,
})

export const cardGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space.s16,
})

export const docCard = style({
  background: vars.color.surface1,
  borderRadius: vars.radius.lg,
  padding: vars.space.s16,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s8,
  cursor: 'pointer',
  border: '1px solid transparent',
  textAlign: 'left',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  color: 'inherit',
  width: '100%',
  selectors: {
    '&:hover': { borderColor: vars.color.border },
  },
})

export const docCardTitle = style({
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
})

export const docCardMeta = style({
  fontSize: vars.fs.caption,
  color: vars.color.textMuted,
})

export const dialogBackdrop = style({
  position: 'absolute',
  inset: 0,
  background: vars.color.overlay,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: vars.z.dialog,
})

export const dialog = style({
  width: vars.size.dialogW,
  background: vars.color.bg,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  padding: vars.space.s24,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s16,
})

export const dialogTitle = style({
  fontSize: vars.fs.h2,
  fontWeight: vars.fw.semi,
})

export const dialogActions = style({
  display: 'flex',
  gap: vars.space.s8,
  justifyContent: 'flex-end',
})

export const dataList = style({
  display: 'flex',
  flexDirection: 'column',
})

export const dataListRow = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: vars.space.s12,
    minHeight: vars.size.buttonLg,
    padding: `${vars.space.s8} ${vars.space.s16}`,
    borderBottom: `1px solid ${vars.color.border}`,
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
  },
  variants: {
    clickable: {
      true: {
        cursor: 'pointer',
        selectors: { '&:hover': { background: vars.color.surface1 } },
      },
    },
  },
})

export const dataListMain = style({
  flex: 1,
  minWidth: 0,
})

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s24,
  maxWidth: '640px',
})

export const formSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s8,
})

export const formSectionTitle = style({
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
  paddingBottom: vars.space.s8,
  borderBottom: `1px solid ${vars.color.border}`,
})

export const formRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s16,
  minHeight: vars.size.buttonMd,
})

export const formRowLabel = style({ fontSize: vars.fs.bodySm })

export const formRowHint = style({
  fontSize: vars.fs.caption,
  color: vars.color.textMuted,
})

export const canvasHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: vars.size.canvasHeader,
  padding: `0 ${vars.space.s24}`,
  borderBottom: `1px solid ${vars.color.border}`,
  flex: 'none',
})

export const canvasHeaderTitle = style({
  fontSize: vars.fs.h1,
  fontWeight: vars.fw.semi,
  margin: 0,
})

export const canvasHeaderActions = style({
  display: 'flex',
  gap: vars.space.s8,
  alignItems: 'center',
})
