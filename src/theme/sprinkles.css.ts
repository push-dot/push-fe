import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'
import { vars } from './vars.css'

const layoutProps = defineProperties({
  conditions: {
    default: {},
    hover: { selector: '&:hover' },
    focusWithin: { selector: '&:focus-within' },
    dark: { selector: '[data-theme="dark"] &' },
  },
  defaultCondition: 'default',
  properties: {
    display: ['none', 'block', 'flex', 'inline-flex', 'grid'],
    position: ['relative', 'absolute', 'fixed', 'sticky'],
    flexDirection: ['row', 'column'],
    alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
    justifyContent: ['flex-start', 'center', 'flex-end', 'space-between'],
    flex: ['none', '1'],
    gap: vars.space,
    padding: vars.space,
    paddingTop: vars.space,
    paddingBottom: vars.space,
    paddingLeft: vars.space,
    paddingRight: vars.space,
    margin: vars.space,
    marginTop: vars.space,
    marginBottom: vars.space,
    width: ['100%', 'auto'],
    minWidth: [0],
    textAlign: ['left', 'center', 'right'],
    overflow: ['hidden', 'auto', 'visible'],
  },
  shorthands: {
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom'],
  },
})

const colorProps = defineProperties({
  conditions: {
    default: {},
    hover: { selector: '&:hover' },
    dark: { selector: '[data-theme="dark"] &' },
  },
  defaultCondition: 'default',
  properties: {
    color: vars.color,
    background: vars.color,
    borderColor: vars.color,
  },
})

const textProps = defineProperties({
  properties: {
    fontSize: vars.fs,
    fontWeight: vars.fw,
    lineHeight: [1.3, 1.5],
    borderRadius: vars.radius,
    boxShadow: vars.shadow,
  },
})

export const sprinkles = createSprinkles(layoutProps, colorProps, textProps)

export type Sprinkles = Parameters<typeof sprinkles>[0]
