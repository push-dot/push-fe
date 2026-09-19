import { globalStyle } from '@vanilla-extract/css'
import { vars } from '@/shared/design/vars.css'

globalStyle('*', {
  boxSizing: 'border-box',
})

globalStyle('html, body, #root', {
  height: '100%',
  margin: 0,
})

globalStyle('body', {
  fontFamily: vars.font.family,
  color: vars.color.text,
  background: vars.color.bg,
  WebkitFontSmoothing: 'antialiased',
})

globalStyle('.app-shell', {
  position: 'relative',
  display: 'flex',
  width: '100%',
  height: '100vh',
  minWidth: '1024px',
  overflowX: 'hidden',
  overflowY: 'auto',
  background: vars.color.bg,
  color: vars.color.text,
})

globalStyle(
  '.sidebar .sidebar-tag, .sidebar .sidebar-item-label, .sidebar .sidebar-label, .sidebar .sidebar-head .t-label',
  {
    transition: `opacity ${vars.motion.base}`,
  },
)

globalStyle('.sidebar.is-collapsed', {
  width: '64px',
})

globalStyle(
  '.sidebar.is-collapsed .sidebar-item-label, .sidebar.is-collapsed .sidebar-tag, .sidebar.is-collapsed .sidebar-label, .sidebar.is-collapsed .sidebar-head .t-label',
  {
    display: 'none',
  },
)

globalStyle('.sidebar.is-collapsed .sidebar-item', {
  justifyContent: 'center',
})

globalStyle('.sidebar', {
  '@media': {
    '(max-width: 1024px)': {
      width: '64px',
    },
  },
})

globalStyle(
  '.sidebar .sidebar-item-label, .sidebar .sidebar-tag, .sidebar .sidebar-label, .sidebar .sidebar-head .t-label',
  {
    '@media': {
      '(max-width: 1024px)': {
        display: 'none',
      },
    },
  },
)

globalStyle('.sidebar .sidebar-item', {
  '@media': {
    '(max-width: 1024px)': {
      justifyContent: 'center',
    },
  },
})

globalStyle('.composer-wrap', {
  position: 'relative',
  flex: 'none',
  width: '60%',
  margin: `0 auto ${vars.space.s24}`,
})

globalStyle('.composer-wrap .composer', {
  margin: 0,
})

globalStyle('.composer-files', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.s8,
  marginBottom: vars.space.s8,
})

globalStyle('.file-chip', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s4,
  padding: `${vars.space.s4} ${vars.space.s8}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.full,
  background: vars.color.surface1,
  fontSize: vars.fs.bodySm,
  maxWidth: '240px',
})

globalStyle('.file-chip-name', {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

globalStyle('.file-chip-remove', {
  display: 'inline-flex',
  alignItems: 'center',
  border: 0,
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: vars.color.textMuted,
})

globalStyle('.inference-popover', {
  position: 'absolute',
  bottom: `calc(100% + ${vars.space.s8})`,
  left: 0,
  width: '320px',
  background: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.md,
  padding: vars.space.s16,
  zIndex: vars.z.sticky,
})

globalStyle('.inference-effort', {
  display: 'flex',
  gap: vars.space.s4,
})

globalStyle('.switch', {
  position: 'relative',
  width: '40px',
  height: '22px',
  border: 0,
  borderRadius: vars.radius.full,
  background: vars.color.surface2,
  cursor: 'pointer',
  padding: 0,
  transition: `background ${vars.motion.base}`,
})

globalStyle('.switch-thumb', {
  position: 'absolute',
  top: '3px',
  left: '3px',
  width: '16px',
  height: '16px',
  borderRadius: vars.radius.full,
  background: vars.color.bg,
  boxShadow: vars.shadow.sm,
  transition: `transform ${vars.motion.base}`,
})

globalStyle('.switch.is-on', {
  background: vars.color.accent,
})

globalStyle('.switch.is-on .switch-thumb', {
  transform: 'translateX(18px)',
})

globalStyle('.card-clickable', {
  cursor: 'pointer',
  border: '1px solid transparent',
  textAlign: 'left',
  font: 'inherit',
  color: 'inherit',
  width: '100%',
})

globalStyle('.card-clickable:hover', {
  borderColor: vars.color.border,
})

globalStyle('.data-list-row-button', {
  cursor: 'pointer',
  background: 'none',
  border: 0,
  borderBottom: `1px solid ${vars.color.border}`,
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
  color: 'inherit',
})

globalStyle('.input-textarea', {
  padding: `${vars.space.s8} ${vars.space.s12}`,
  minHeight: '96px',
  resize: 'vertical',
  fontFamily: vars.font.family,
})

globalStyle('.editor-body', {
  outline: 'none',
})

globalStyle('.editor-body p', {
  margin: `0 0 ${vars.space.s12}`,
})

globalStyle('.editor-body h1', {
  fontSize: vars.fs.h1,
  fontWeight: vars.fw.semi,
  margin: `0 0 ${vars.space.s16}`,
})

globalStyle('.editor-body h2', {
  fontSize: vars.fs.h2,
  fontWeight: vars.fw.semi,
  margin: `0 0 ${vars.space.s12}`,
})

globalStyle('.editor-body h3', {
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
  margin: `0 0 ${vars.space.s8}`,
})

globalStyle('.editor-body ul, .editor-body ol', {
  margin: `0 0 ${vars.space.s12}`,
  paddingLeft: vars.space.s24,
})

globalStyle('.home-command', {
  alignSelf: 'center',
})

globalStyle('.plan-subtitle', {
  color: vars.color.textMuted,
  fontSize: vars.fs.bodySm,
  margin: `0 0 ${vars.space.s16}`,
})

globalStyle('.plan-grid', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: vars.space.s16,
  maxWidth: '720px',
})

globalStyle('.plan-card', {
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s12,
  padding: vars.space.s16,
  background: vars.color.surface1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
})

globalStyle('.plan-card.is-featured', {
  borderColor: vars.color.accent,
})

globalStyle('.plan-card-head', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.s8,
})

globalStyle('.plan-card-name', {
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
})

globalStyle('.plan-card-badge', {
  flex: 'none',
  fontSize: vars.fs.caption,
  fontWeight: vars.fw.medium,
  color: vars.color.accent,
  background: vars.color.accentSoft,
  borderRadius: vars.radius.full,
  padding: `2px ${vars.space.s8}`,
})

globalStyle('.plan-card-price', {
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space.s4,
})

globalStyle('.plan-card-amount', {
  fontSize: vars.fs.h1,
  fontWeight: vars.fw.semi,
})

globalStyle('.plan-card-cycle', {
  color: vars.color.textMuted,
  fontSize: vars.fs.bodySm,
})

globalStyle('.plan-card-features', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s8,
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

globalStyle('.plan-card-features li', {
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s8,
  fontSize: vars.fs.bodySm,
  color: vars.color.text,
})

globalStyle('.plan-card-features .icon', {
  flex: 'none',
  color: vars.color.accent,
})

globalStyle('.drop-overlay', {
  position: 'fixed',
  inset: 0,
  zIndex: vars.z.dialog,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s12,
  background: vars.color.overlay,
  color: vars.color.text,
  fontSize: vars.fs.h2,
  fontWeight: vars.fw.semi,
  pointerEvents: 'none',
})

globalStyle('.drop-overlay .icon', {
  color: vars.color.accent,
})

globalStyle('.form-row-plan', {
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s12,
})
