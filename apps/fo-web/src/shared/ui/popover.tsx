import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

import { NARROW, useMedia } from '../lib/use-media'
import { useEscape } from './dialog'
import { Icon, type IconName } from './icon'

type PopoverProps = { label: string; onClose: () => void; className?: string; style?: CSSProperties; children: ReactNode }

export const Popover = ({ label, onClose, className, style, children }: PopoverProps) => {
  const narrow = useMedia(NARROW)
  const ref = useRef<HTMLDivElement>(null)
  useEscape(onClose)
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
    // The header's backdrop-filter is a containing block for position:fixed, so the sheet leaves it.
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
    <div ref={ref} className={['pop', className ?? ''].filter(Boolean).join(' ')} role="dialog" aria-label={label} style={style}>
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
