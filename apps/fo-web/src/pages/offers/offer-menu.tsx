import { useState } from 'react'

import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon, type IconName } from '../../shared/ui/icon'
import { Menu, Popover, type MenuItem } from '../../shared/ui/popover'
import { OFFER_MENU, OFFER_MENU_COPY, offerBlockConfirm } from './constants'
import type { OfferMenuKey } from './lib'

type OfferMenuProps = {
  keys: OfferMenuKey[][]
  personId: string
  personName: string
  busy: boolean
  onAction: (key: Exclude<OfferMenuKey, 'profile'>) => void
}

const ICONS: Record<OfferMenuKey, IconName> = { profile: 'user', archive: 'archive', unarchive: 'archive', report: 'flag', block: 'ban' }

const OfferMenu = ({ keys, personId, personName, busy, onAction }: OfferMenuProps) => {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const close = () => setOpen(false)
  const item = (key: OfferMenuKey): MenuItem => {
    if (key === 'profile') return { label: OFFER_MENU_COPY.profile, icon: ICONS.profile, to: `/profiles/${personId}` }
    if (key === 'block') return { label: OFFER_MENU_COPY.block, icon: ICONS.block, danger: true, onSelect: () => setConfirming(true) }
    return { label: OFFER_MENU_COPY[key], icon: ICONS[key], onSelect: () => onAction(key) }
  }
  const items = keys.flatMap((group, index): MenuItem[] => [...(index > 0 ? [{ divider: true as const }] : []), ...group.map(item)])
  const ask = offerBlockConfirm(personName)
  return (
    <span className="thread-menu">
      <button type="button" className="hbtn" aria-label={OFFER_MENU} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name="more" size={22} width={3} />
      </button>
      {open ? (
        <Popover label={OFFER_MENU} onClose={close} className="thread-pop">
          <Menu items={items} onClose={close} />
        </Popover>
      ) : null}
      {confirming ? (
        <ConfirmDialog
          title={ask.title}
          body={
            <>
              <p>{ask.body}</p>
              <p className="c1 t2 offer-block-note">
                <Icon name="info" size={18} className="t3" />
                {ask.note}
              </p>
            </>
          }
          confirmLabel={ask.confirm}
          danger
          busy={busy}
          onConfirm={() => {
            setConfirming(false)
            onAction('block')
          }}
          onClose={() => setConfirming(false)}
        />
      ) : null}
    </span>
  )
}

export default OfferMenu
