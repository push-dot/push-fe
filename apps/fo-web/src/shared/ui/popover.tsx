import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { NARROW, useMedia } from '../lib/use-media'
import { useEscape } from './dialog'
import { Icon, type IconName } from './icon'

const GAP = 8

// A menu that would run past the bottom of the window opens above its button instead, when it fits there.
export const opensUp = (pop: { top: number; bottom: number }, host: { top: number }, viewport: number) =>
  pop.bottom > viewport - GAP && host.top - (pop.bottom - pop.top) - GAP >= 0

type PopoverProps = { label: string; onClose: () => void; className?: string; style?: CSSProperties; children: ReactNode }

export const Popover = ({ label, onClose, className, style, children }: PopoverProps) => {
  const narrow = useMedia(NARROW)
  const ref = useRef<HTMLDivElement>(null)
  const [up, setUp] = useState(false)
  useEscape(onClose)
  useLayoutEffect(() => {
    const host = ref.current?.parentElement
    if (narrow || !ref.current || !host) return
    setUp(opensUp(ref.current.getBoundingClientRect(), host.getBoundingClientRect(), window.innerHeight))
  }, [narrow])
  useEffect(() => {
    if (narrow) return
    const onDown = (event: PointerEvent) => {
      const host = ref.current?.parentElement
      if (host && !host.contains(event.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [narrow, onClose])
  if (narrow) {
    return createPortal(
      <div className="msheet-scrim" role="presentation" onClick={onClose}>
        <div className={['msheet', className ?? ''].filter(Boolean).join(' ')} role="dialog" aria-modal="true" aria-label={label} onClick={(event) => event.stopPropagation()}>
          {children}
        </div>
      </div>,
      document.querySelector('.browser') ?? document.body,
    )
  }
  return (
    <div ref={ref} className={['pop', up ? 'pop-up' : '', className ?? ''].filter(Boolean).join(' ')} role="dialog" aria-label={label} style={style}>
      {children}
    </div>
  )
}

export type MenuItem =
  | { divider: true }
  | { label: string; icon?: IconName; to?: string; onSelect?: () => void; danger?: boolean; divider?: false }

export const Menu = ({ items, onClose }: { items: MenuItem[]; onClose: () => void }) => (
  <div className="menu" role="menu">
    {items.map((item, index) => {
      if (item.divider) return <div key={`hr${index}`} className="hr" role="separator" />
      const body = (
        <>
          {item.icon ? <Icon name={item.icon} size={20} /> : null}
          <span className="w6">{item.label}</span>
        </>
      )
      const className = item.danger ? 'mi red' : 'mi'
      return item.to ? (
        <Link key={item.label} to={item.to} role="menuitem" className={className} onClick={onClose}>
          {body}
        </Link>
      ) : (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className={className}
          onClick={() => {
            item.onSelect?.()
            onClose()
          }}
        >
          {body}
        </button>
      )
    })}
  </div>
)
