import { Link } from 'react-router-dom'
import { NAV } from '../../app/constants'
import { GUEST_APPLY_BODY, GUEST_APPLY_TITLE, SIGN_UP } from './constants'

const GuestApplyDialog = ({ onClose, onLogin, onSignup }: { onClose: () => void; onLogin: () => void; onSignup: () => void }) => (
  <div className="sheet-scrim" role="presentation" onClick={onClose}>
    <div className="sheet" role="dialog" aria-modal="true" aria-label={GUEST_APPLY_TITLE} onClick={(event) => event.stopPropagation()}>
      <h2 className="h2">{GUEST_APPLY_TITLE}</h2>
      <p className="b2 t3">{GUEST_APPLY_BODY}</p>
      <button type="button" className="btn pri lg block" onClick={onLogin}>
        {NAV.login}
      </button>
      <Link to="/signup" className="btn sec lg block" onClick={onSignup}>
        {SIGN_UP}
      </Link>
    </div>
  </div>
)

export default GuestApplyDialog
