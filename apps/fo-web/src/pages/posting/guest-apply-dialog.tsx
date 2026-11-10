import { Link } from 'react-router-dom'
import { NAV } from '../../app/constants'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { GUEST_APPLY_BODY, GUEST_APPLY_TITLE, SIGN_UP } from './constants'

const GuestApplyDialog = ({ onClose, onLogin, onSignup }: { onClose: () => void; onLogin: () => void; onSignup: () => void }) => (
  <Dialog label={GUEST_APPLY_TITLE} onClose={onClose} className="guest-apply">
    <span className="guest-apply-tile">
      <Icon name="user" size={34} width={1.8} />
    </span>
    <h2 className="h2">{GUEST_APPLY_TITLE}</h2>
    <p className="b2 t3">{GUEST_APPLY_BODY}</p>
    <div className="guest-apply-actions">
      <button type="button" className="btn pri block" onClick={onLogin}>
        {NAV.login}
      </button>
      <Link to="/signup" className="btn sec block" onClick={onSignup}>
        {SIGN_UP}
      </Link>
    </div>
  </Dialog>
)

export default GuestApplyDialog
