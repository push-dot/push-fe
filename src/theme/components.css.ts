import { fallbackVar, globalStyle, keyframes } from '@vanilla-extract/css'
import { vars } from '@push/design-system'
import { menuX, menuY } from '@push/design-system'

globalStyle('.screen', {
  width: vars.frame.w,
  height: vars.frame.h,
  display: 'flex',
  overflow: 'hidden',
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.font.family,
})

globalStyle('.sidebar', {
  width: vars.size.sidebar,
  position: 'relative',
  flex: 'none',
  display: 'flex',
  flexDirection: 'column',
  background: vars.color.surface1,
  borderRight: `1px solid ${vars.color.border}`,
  padding: `${vars.space.s12} ${vars.space.s8}`,
  gap: vars.space.s4,
})
globalStyle('.sidebar-edge', {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '30px',
  height: '100vh',
  zIndex: 50,
})
globalStyle('.sidebar.is-hidden', {
  display: 'none',
})
globalStyle('.sidebar.is-hidden.is-peek', {
  display: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  zIndex: 60,
  boxShadow: vars.shadow.md,
})
globalStyle('.sidebar-head', {
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.s4} ${vars.space.s8}`,
})
globalStyle('.sidebar-section', {
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
})
globalStyle('.sidebar-scroll', {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s4,
})
globalStyle('.sidebar-label', {
  fontSize: vars.fs.caption,
  fontWeight: vars.fw.medium,
  color: vars.color.textMuted,
  padding: `${vars.space.s8} ${vars.space.s8} ${vars.space.s4}`,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
})
globalStyle('.sidebar-item', {
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s8,
  minHeight: vars.size.sidebarRow,
  padding: `0 ${vars.space.s8}`,
  border: 0,
  borderRadius: vars.radius.md,
  background: 'transparent',
  color: vars.color.text,
  fontSize: vars.fs.bodySm,
  textAlign: 'left',
  cursor: 'pointer',
})
globalStyle('.sidebar-item:hover', {
  background: vars.color.surface2,
})
globalStyle('.sidebar-item.is-active', {
  background: vars.color.accentSoft,
  color: vars.color.accent,
  fontWeight: vars.fw.medium,
})
globalStyle('.sidebar-item .icon', {
  flex: 'none',
})
globalStyle('.sidebar-item-label', {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
globalStyle('.sidebar-item-pin', {
  flex: 'none',
  color: vars.color.textMuted,
})
globalStyle('.sidebar-item-input', {
  flex: 1,
  minWidth: 0,
  border: `1px solid ${vars.color.accent}`,
  borderRadius: vars.radius.sm,
  background: vars.color.surface2,
  color: vars.color.text,
  fontSize: vars.fs.bodySm,
  padding: '2px 6px',
  outline: 'none',
})
globalStyle('.sidebar-resizer', {
  position: 'absolute',
  top: 0,
  right: '-3px',
  width: '6px',
  height: '100%',
  cursor: 'col-resize',
  zIndex: 10,
})
globalStyle('.sidebar-resizer:hover', {
  background: vars.color.accentSoft,
})
globalStyle('body.is-resizing', {
  cursor: 'col-resize',
  userSelect: 'none',
})
globalStyle('.context-menu', {
  position: 'fixed',
  left: fallbackVar(menuX, '0px'),
  top: fallbackVar(menuY, '0px'),
  zIndex: 100,
  minWidth: '150px',
  display: 'flex',
  flexDirection: 'column',
  padding: vars.space.s4,
  background: vars.color.surface1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.md,
})
globalStyle('.context-menu-item', {
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s8,
  padding: vars.space.s8,
  border: 0,
  borderRadius: vars.radius.sm,
  background: 'transparent',
  color: vars.color.text,
  fontSize: vars.fs.bodySm,
  textAlign: 'left',
  cursor: 'pointer',
})
globalStyle('.context-menu-item:hover', {
  background: vars.color.surface2,
})
globalStyle('.context-menu-item.is-danger', {
  color: vars.color.danger,
})
globalStyle('.sidebar-dot', {
  width: vars.size.dot,
  height: vars.size.dot,
  borderRadius: vars.radius.full,
  flex: 'none',
  background: vars.color.textMuted,
})
globalStyle('.sidebar-dot.is-on', {
  background: vars.color.success,
})
globalStyle('.sidebar-dot.is-busy', {
  background: vars.color.warn,
})
globalStyle('.sidebar-foot', {
  marginTop: 'auto',
  flex: 'none',
})
globalStyle('.sidebar-tag', {
  flex: 'none',
  fontSize: vars.fs.caption,
  color: vars.color.accent,
  background: vars.color.accentSoft,
  borderRadius: vars.radius.sm,
  padding: `0 ${vars.space.s4}`,
})

globalStyle('.canvas', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
})
globalStyle('.canvas-body', {
  flex: 1,
  overflowY: 'auto',
  padding: vars.space.s24,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s24,
})


globalStyle('.composer', {
  flex: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s8,
  margin: `0 ${vars.space.s24} ${vars.space.s16}`,
  padding: `${vars.space.s4} ${vars.space.s8} ${vars.space.s4} ${vars.space.s16}`,
  minHeight: vars.size.buttonLg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.bg,
  boxShadow: vars.shadow.sm,
})
globalStyle('.composer:focus-within', {
  outline: `2px solid ${vars.color.accent}`,
})
globalStyle('.composer-field', {
  flex: 1,
  border: 0,
  outline: 0,
  fontSize: vars.fs.body,
  fontFamily: 'inherit',
  lineHeight: 1.5,
  padding: `${vars.space.s4} 0`,
  background: 'transparent',
  color: vars.color.text,
  resize: 'none',
})
globalStyle('.composer-field::placeholder', {
  color: vars.color.textMuted,
})

globalStyle('.chat-stream-virtual', {
  flex: 1,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
})
globalStyle('.chat-stream', {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s16,
  padding: vars.space.s24,
})
globalStyle('.chat-vlist', {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  display: 'flex',
  flexDirection: 'column',
})
globalStyle('.chat-stream-row', {
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s8,
  padding: `0 ${vars.space.s24} ${vars.space.s16}`,
})
globalStyle('.chat-stream-row:first-child', {
  paddingTop: vars.space.s24,
})
globalStyle('.chat-stream-msg', {
  maxWidth: '72%',
  padding: `${vars.space.s12} ${vars.space.s16}`,
  borderRadius: vars.radius.lg,
  fontSize: vars.fs.body,
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
})
globalStyle('.chat-stream-msg-ai', {
  alignSelf: 'flex-start',
  background: vars.color.surface1,
})
globalStyle('.chat-stream-msg-user', {
  alignSelf: 'flex-end',
  background: vars.color.accent,
  color: vars.color.bg,
})

const chatCursorBlink = keyframes({
  '50%': { opacity: 0 },
})

globalStyle('.chat-stream-msg-live .chat-stream-cursor', {
  display: 'inline-block',
  width: '0.5em',
  height: '1em',
  marginLeft: '2px',
  verticalAlign: 'text-bottom',
  background: 'currentColor',
  animation: `${chatCursorBlink} 0.9s steps(2) infinite`,
})
globalStyle('.chat-md', {
  whiteSpace: 'normal',
})
globalStyle('.chat-md p', {
  margin: `0 0 ${vars.space.s8}`,
})
globalStyle('.chat-md > :last-child', {
  marginBottom: 0,
})
globalStyle('.chat-md h1, .chat-md h2, .chat-md h3, .chat-md h4', {
  margin: `${vars.space.s12} 0 ${vars.space.s8}`,
  lineHeight: 1.3,
})
globalStyle('.chat-md h1', { fontSize: vars.fs.h1 })
globalStyle('.chat-md h2', { fontSize: vars.fs.h2 })
globalStyle('.chat-md h3, .chat-md h4', { fontSize: vars.fs.body })
globalStyle('.chat-md ul, .chat-md ol', {
  margin: `0 0 ${vars.space.s8}`,
  paddingLeft: vars.space.s24,
})
globalStyle('.chat-md table', {
  borderCollapse: 'collapse',
  margin: `0 0 ${vars.space.s8}`,
  fontSize: vars.fs.bodySm,
  width: '100%',
})
globalStyle('.chat-md th, .chat-md td', {
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.space.s4} ${vars.space.s8}`,
  textAlign: 'left',
})
globalStyle('.chat-md th', {
  background: vars.color.surface2,
})
globalStyle('.chat-md pre', {
  background: vars.color.surface2,
  borderRadius: vars.radius.md,
  padding: vars.space.s8,
  overflowX: 'auto',
  fontSize: vars.fs.bodySm,
  margin: `0 0 ${vars.space.s8}`,
})
globalStyle('.chat-md code', {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: '0.9em',
})
globalStyle('.chat-md blockquote', {
  borderLeft: `3px solid ${vars.color.border}`,
  margin: `0 0 ${vars.space.s8}`,
  paddingLeft: vars.space.s8,
  color: vars.color.textMuted,
})
globalStyle('.chat-md a', {
  color: vars.color.accent,
})
globalStyle('.chat-md hr', {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.space.s12} 0`,
})
globalStyle('.chat-attach-chip', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s8,
  alignSelf: 'flex-start',
  maxWidth: '280px',
  padding: `${vars.space.s8} ${vars.space.s12}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface1,
  fontSize: vars.fs.caption,
  color: vars.color.textMuted,
})
globalStyle('.chat-attach-chip-user', {
  alignSelf: 'flex-end',
})
globalStyle('.chat-attach-chip-title', {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: vars.color.text,
  fontWeight: vars.fw.medium,
})
globalStyle('.chat-attach-chip-meta', {
  flexShrink: 0,
})
globalStyle('.chat-attach-chip-actions', {
  display: 'inline-flex',
  gap: vars.space.s8,
  flexShrink: 0,
})
globalStyle('.chat-msg-actions', {
  display: 'flex',
  alignSelf: 'flex-start',
  marginTop: vars.space.s8,
})
globalStyle('.chat-msg-action', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.s8,
  padding: `${vars.space.s8} ${vars.space.s12}`,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  color: vars.color.textMuted,
  fontSize: vars.fs.caption,
  cursor: 'pointer',
})
globalStyle('.chat-msg-action:hover', {
  background: vars.color.surface1,
  color: vars.color.text,
})
globalStyle('.chat-stream-status', {
  fontSize: vars.fs.caption,
  color: vars.color.textMuted,
  marginBottom: vars.space.s8,
})
globalStyle('.chat-stream-loading', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  textAlign: 'center',
  fontSize: vars.fs.caption,
  color: vars.color.textMuted,
  padding: vars.space.s8,
})
globalStyle('.chat-stream-failed', {
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s8,
  color: vars.color.danger,
  fontSize: vars.fs.caption,
})
globalStyle('.chat-jump-bottom', {
  position: 'absolute',
  right: vars.space.s24,
  bottom: vars.space.s16,
  zIndex: 1,
  borderRadius: '50%',
  background: vars.color.surface1,
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.15)',
})

globalStyle('.approval-card', {
  alignSelf: 'stretch',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: vars.color.bg,
  padding: vars.space.s16,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.s12,
})
globalStyle('.approval-card-title', {
  fontSize: vars.fs.h3,
  fontWeight: vars.fw.semi,
})
globalStyle('.approval-card-body', {
  fontSize: vars.fs.bodySm,
  color: vars.color.textMuted,
})
globalStyle('.approval-card-cmd', {
  fontFamily: vars.font.mono,
  fontSize: vars.fs.label,
  background: vars.color.surface1,
  borderRadius: vars.radius.md,
  padding: vars.space.s12,
  whiteSpace: 'pre-wrap',
})
globalStyle('.approval-card-actions', {
  display: 'flex',
  gap: vars.space.s8,
  justifyContent: 'flex-end',
})


globalStyle('.editor', {
  flex: 1,
  overflowY: 'auto',
  padding: `${vars.space.s24} ${vars.space.s48}`,
})
globalStyle('.editor-body', {
  fontSize: vars.fs.body,
  lineHeight: 1.7,
  outline: 'none',
  maxWidth: '720px',
  margin: '0 auto',
})



globalStyle('.empty-state', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.s12,
  padding: vars.space.s48,
  color: vars.color.textMuted,
  textAlign: 'center',
})
globalStyle('.empty-state-icon', {
  color: vars.color.textMuted,
})
globalStyle('.error-state', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s8,
  padding: vars.space.s24,
  color: vars.color.danger,
  textAlign: 'center',
})

globalStyle('.toast', {
  position: 'absolute',
  bottom: vars.space.s24,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.s8,
  padding: `${vars.space.s8} ${vars.space.s16}`,
  borderRadius: vars.radius.full,
  background: vars.color.text,
  color: vars.color.bg,
  fontSize: vars.fs.bodySm,
  zIndex: vars.z.toast,
})

globalStyle('.center', {
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.s24,
})

globalStyle('.icon', {
  flex: 'none',
  strokeWidth: 1.75,
})
