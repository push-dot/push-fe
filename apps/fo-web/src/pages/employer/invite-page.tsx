import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import { INVITE_ACCEPT_FAILED } from './constants'

const InvitePage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    const accept = async () => {
      try {
        await api.companies.acceptInvite(token)
        navigate('/')
      } catch {
        setFailed(true)
      }
    }
    void accept()
  }, [navigate, token])

  if (!token || failed) {
    return (
      <main className="page">
        <p className="b1 stack" role="alert">
          {INVITE_ACCEPT_FAILED}
        </p>
      </main>
    )
  }

  return <main className="page" aria-busy="true" />
}

export default InvitePage
