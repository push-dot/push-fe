const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Where Tab lands inside a modal: past the last control back to the first, Shift+Tab the other way. null leaves it to the browser. */
export const trapTarget = <T>(items: readonly T[], active: unknown, shift: boolean): T | null => {
  const at = items.indexOf(active as T)
  if (shift) return at <= 0 ? (items[items.length - 1] ?? null) : null
  return at === -1 || at === items.length - 1 ? (items[0] ?? null) : null
}

export const trapTab = (
  container: HTMLElement,
  event: { key: string; shiftKey: boolean; preventDefault: () => void },
) => {
  if (event.key !== 'Tab') return
  const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
  const target = items.length
    ? trapTarget(items, document.activeElement, event.shiftKey)
    : container
  if (!target) return
  event.preventDefault()
  target.focus()
}

/** The menu item a key moves to (WAI-ARIA menu): arrows wrap, Home/End jump. null for any other key. */
export const menuStep = (count: number, at: number, key: string): number | null => {
  if (!count) return null
  if (key === 'ArrowDown') return at < 0 ? 0 : (at + 1) % count
  if (key === 'ArrowUp') return at <= 0 ? count - 1 : at - 1
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}

// A menu item that opens a dialog is gone by the time the dialog closes, so the popover hands over its own opener (the ⋯ button).
const popoverOpeners = new WeakMap<Element, HTMLElement>()

export const rememberOpener = (popover: Element, opener: HTMLElement) =>
  popoverOpeners.set(popover, opener)

export const openerOf = (active: Element | null): HTMLElement | null => {
  for (let node = active; node; node = node.parentElement) {
    const opener = popoverOpeners.get(node)
    if (opener) return opener
  }
  return active instanceof HTMLElement && active !== document.body ? active : null
}

/** Puts focus back where it was before a modal or menu opened, unless the user already moved it somewhere else on purpose. */
export const returnFocus = (opener: HTMLElement | null, closing: Element | null) => {
  const active = document.activeElement
  if (!opener?.isConnected) return
  if (!active || active === document.body || closing?.contains(active)) opener.focus()
}
