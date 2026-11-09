import { useCallback, useState } from 'react'
import { Icon } from '../../shared/ui/icon'
import { Menu, Popover, type MenuItem } from '../../shared/ui/popover'
import { MORE_LABEL } from './constants'

const RowMore = ({ label, items }: { label: string; items: MenuItem[] }) => {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <span className="row-more">
      <button
        type="button"
        className="hbtn"
        aria-label={`${label} ${MORE_LABEL}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="more" size={20} width={3} />
      </button>
      {open ? (
        <Popover label={label} onClose={close} className="row-pop">
          <Menu items={items} onClose={close} />
        </Popover>
      ) : null}
    </span>
  )
}

export default RowMore
