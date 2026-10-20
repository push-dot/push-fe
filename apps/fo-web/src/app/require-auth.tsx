import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { gateAccount, saveReturnTo } from '../shared/auth/return-path'
import { useSession } from '../shared/auth/use-session'
import { employerGate, needsLogin } from '../shared/model/access'

const RequireAuth = () => {
  const location = useLocation()
  const session = useSession()
  const gate = employerGate(location.pathname, gateAccount(session))
  if (needsLogin(location.pathname, session !== null) || gate === 'login') {
    saveReturnTo(`${location.pathname}${location.search}`)
    return <Navigate to="/login" replace />
  }
  if (gate === 'verify') return <Navigate to="/employer/verify" replace />
  return <Outlet />
}

export default RequireAuth
