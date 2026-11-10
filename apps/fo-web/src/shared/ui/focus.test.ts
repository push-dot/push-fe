import { describe, expect, it } from 'vitest'

import { menuStep, trapTarget } from './focus'

describe('trapTarget', () => {
  const items = ['close', 'cancel', 'save']

  it('wraps Tab from the last control to the first and Shift+Tab from the first to the last', () => {
    expect(trapTarget(items, 'save', false)).toBe('close')
    expect(trapTarget(items, 'close', true)).toBe('save')
  })

  it('starts from the first or last control when the dialog itself has focus', () => {
    expect(trapTarget(items, 'dialog', false)).toBe('close')
    expect(trapTarget(items, 'dialog', true)).toBe('save')
  })

  it('leaves Tab between inner controls to the browser', () => {
    expect(trapTarget(items, 'cancel', false)).toBeNull()
    expect(trapTarget(items, 'cancel', true)).toBeNull()
  })
})

describe('menuStep', () => {
  it('moves down and up with wrap-around', () => {
    expect(menuStep(3, 0, 'ArrowDown')).toBe(1)
    expect(menuStep(3, 2, 'ArrowDown')).toBe(0)
    expect(menuStep(3, 0, 'ArrowUp')).toBe(2)
    expect(menuStep(3, 2, 'ArrowUp')).toBe(1)
  })

  it('enters the menu from outside at the first or last item', () => {
    expect(menuStep(3, -1, 'ArrowDown')).toBe(0)
    expect(menuStep(3, -1, 'ArrowUp')).toBe(2)
  })

  it('jumps with Home and End and ignores other keys', () => {
    expect(menuStep(3, 1, 'Home')).toBe(0)
    expect(menuStep(3, 1, 'End')).toBe(2)
    expect(menuStep(3, 1, 'Enter')).toBeNull()
    expect(menuStep(0, -1, 'ArrowDown')).toBeNull()
  })
})
