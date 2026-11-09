import { useState } from 'react'

import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { Menu, Popover, type MenuItem } from '../../shared/ui/popover'
import {
  OFFER_BLOCK_BODY,
  OFFER_BLOCK_CONFIRM,
  OFFER_BLOCK_NOTE,
  OFFER_BLOCK_TITLE,
  OFFER_MENU,
  OFFER_MENU_ARCHIVE,
  OFFER_MENU_BLOCK,
  OFFER_MENU_REPORT,
  OFFER_MENU_UNARCHIVE,
  OFFER_PROFILE,
} from './constants'

type OfferMenuProps = {
  personId: string
  personName: string
  archivable: boolean
  archived: boolean
  onArchive: () => void
  onUnarchive: () => void
  onReport: () => void
  onBlock: () => void
}

const OfferMenu = ({ personId, personName, archivable, archived, onArchive, onUnarchive, onReport, onBlock }: OfferMenuProps) => {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const items: MenuItem[] = [
    { label: OFFER_PROFILE, icon: 'user', to: `/profiles/${personId}` },
    ...(archivable
      ? [archived ? { label: OFFER_MENU_UNARCHIVE, icon: 'archive' as const, onSelect: onUnarchive } : { label: OFFER_MENU_ARCHIVE, icon: 'archive' as const, onSelect: onArchive }]
      : []),
    { divider: true },
    { label: OFFER_MENU_REPORT, icon: 'flag', onSelect: onReport },
    { label: OFFER_MENU_BLOCK, icon: 'ban', danger: true, onSelect: () => setConfirming(true) },
  ]
  return (
    <span className="inbox-menu">
      <button type="button" className="hbtn" aria-label={OFFER_MENU} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name="more" size={22} width={3} />
      </button>
      {open ? (
        <Popover label={OFFER_MENU} onClose={() => setOpen(false)}>
          <Menu items={items} onClose={() => setOpen(false)} />
        </Popover>
      ) : null}
      {confirming ? (
        <ConfirmDialog
          title={OFFER_BLOCK_TITLE(personName)}
          body={
            <>
              <p>{OFFER_BLOCK_BODY(personName)}</p>
              <p className="c1 t2 inbox-block-note">
                <Icon name="info" size={18} width={2} className="t3" />
                {OFFER_BLOCK_NOTE}
              </p>
            </>
          }
          confirmLabel={OFFER_BLOCK_CONFIRM}
          danger
          onConfirm={() => {
            onBlock()
            setConfirming(false)
          }}
          onClose={() => setConfirming(false)}
        />
      ) : null}
    </span>
  )
}

export default OfferMenu
