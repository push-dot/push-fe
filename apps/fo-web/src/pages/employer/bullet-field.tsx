import type { KeyboardEvent } from 'react'

import { nextBullet, withBullets } from './editor-form'

// A textarea that keeps one "· " in front of every line, as the board draws it.
const BulletField = ({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) => {
  const enter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    const area = event.currentTarget
    const next = nextBullet(value, area.selectionStart)
    onChange(next.value)
    requestAnimationFrame(() => area.setSelectionRange(next.caret, next.caret))
  }
  return (
    <textarea
      aria-label={label}
      rows={Math.max(2, value.split('\n').length)}
      value={value}
      onFocus={() => value || onChange('· ')}
      onChange={(event) => onChange(event.target.value)}
      onBlur={() => onChange(withBullets(value))}
      onKeyDown={enter}
    />
  )
}

export default BulletField
