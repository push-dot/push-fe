import { ApiError, type InvitePreview } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useQuery } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { authMe, useAuthMe } from '../../entities/session'
import { companiesAcceptInvite, companiesInvitePreview } from '../../features/accept-invite'
import { saveReturnTo, saveSignupReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { useSession } from '../../shared/auth/use-session'
import { ROLE_NAME } from '../../shared/model/employer-plan'
import { GoogleMark, Icon } from '../../shared/ui/icon'
import { LoadFail } from '../../shared/ui/page-state'
import AuthAlert from '../login/auth-alert'
import AuthResult from '../login/auth-result'
import { useOAuthStart } from '../login/oauth-start'
import {
  INVITE_ACCEPT_FAILED,
  INVITE_ACCEPTING,
  INVITE_CAN,
  INVITE_EMAIL_ACCEPT,
  INVITE_EXPIRED_NEXT,
  INVITE_EXPIRED_TITLE,
  INVITE_EXPIRED_WHY,
  INVITE_FACT_COMPANY,
  INVITE_GOOGLE,
  INVITE_HAS_ACCOUNT,
  INVITE_HOME,
  INVITE_INVALID_NEXT,
  INVITE_INVALID_TITLE,
  INVITE_INVALID_WHY,
  INVITE_KEEP,
  INVITE_LEAD_OBJECT,
  INVITE_LEAD_ROLE,
  INVITE_LEAD_SUBJECT,
  INVITE_LIMIT,
  INVITE_LOGIN,
  INVITE_OTHER_ACCOUNT,
  INVITE_OTHER_AS,
  INVITE_OTHER_NEED,
  INVITE_OTHER_NOW,
  INVITE_OTHER_PERSONAL,
  INVITE_OTHER_TITLE,
  INVITE_PERKS,
  INVITE_RELOGIN,
  INVITE_TO_AGENT,
  INVITE_TO_POSTINGS,
  INVITE_WELCOME_CAN,
  INVITE_WELCOME_LEAD,
  INVITE_WELCOME_ROLE,
  inviterLabel,
  invitePreparing,
  inviteTitle,
  inviteWelcome,
} from './constants'

// push-be details on the preview (404) and on accept (403/404/409): reason, plus companyName for EXPIRED.
const detailOf = (caught: unknown, key: 'reason' | 'companyName') =>
  caught instanceof ApiError ? String(caught.details?.[key] ?? '') : ''
const DEAD_LINK = new Set(['INVALID', 'ACCEPTED', 'COMPANY_DELETING'])

const Perks = ({ title, items }: { title: string; items: readonly string[] }) => (
  <div className="auth-perks">
    <strong>{title}</strong>
    <ul>
      {items.map((perk) => (
        <li key={perk}>
          <Icon name="check" size={16} width={2.6} />
          {perk}
        </li>
      ))}
    </ul>
  </div>
)

const CompanyHead = ({ invite, title, children, done }: { invite: InvitePreview; title: string; children: ReactNode; done?: boolean }) => (
  <div className="auth-center invite">
    <span className="auth-invite-mark">
      <span className="av" style={{ background: brandColor(invite.companyName) }} aria-hidden="true">
        {invite.companyName.slice(0, 1)}
      </span>
      {done ? (
        <span className="auth-invite-done" aria-hidden="true">
          <Icon name="check" size={16} width={3} />
        </span>
      ) : null}
    </span>
    <h1>{title}</h1>
    <p className="auth-mail-copy">{children}</p>
  </div>
)

const InvitePage = () => {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const personal = session?.user.accountType === 'PERSONAL'
  const preview = useQuery({ queryKey: ['invite', token], queryFn: () => companiesInvitePreview(token), retry: false })
  const [accepting, setAccepting] = useState(false)
  const [joined, setJoined] = useState(false)
  const [acceptError, setAcceptError] = useState<unknown>(null)
  const oauth = useOAuthStart()
  const mismatch = personal || detailOf(acceptError, 'reason') === 'EMAIL_MISMATCH'
  const me = useAuthMe(Boolean(session) && mismatch)
  const failure = preview.error ?? acceptError
  const reason = detailOf(failure, 'reason')

  if (preview.isPending) return <main className="auth-card" aria-busy="true" />

  if (reason === 'EXPIRED') {
    const company = detailOf(failure, 'companyName')
    return (
      <main className="auth-card">
        <AuthResult icon="clock" tone="grey" title={INVITE_EXPIRED_TITLE}>
          {INVITE_EXPIRED_WHY}
          <br />
          {INVITE_EXPIRED_NEXT}
        </AuthResult>
        {company ? (
          <dl className="auth-facts plain">
            <div>
              <dt>{INVITE_FACT_COMPANY}</dt>
              <dd>{company}</dd>
            </div>
          </dl>
        ) : null}
        <Link className="auth-btn sec" to="/">
          {INVITE_HOME}
        </Link>
      </main>
    )
  }

  if (DEAD_LINK.has(reason)) {
    return (
      <main className="auth-card">
        <AuthResult icon="link" tone="red" title={INVITE_INVALID_TITLE}>
          {INVITE_INVALID_WHY}
          <br />
          {INVITE_INVALID_NEXT}
        </AuthResult>
        <Link className="auth-btn sec" to="/">
          {INVITE_HOME}
        </Link>
        {session ? null : (
          <p className="auth-foot">
            {INVITE_HAS_ACCOUNT} <Link to="/login?accountType=EMPLOYER">{INVITE_LOGIN}</Link>
          </p>
        )}
      </main>
    )
  }

  if (!preview.data) {
    return (
      <main className="auth-card">
        <LoadFail onRetry={() => void preview.refetch()} />
      </main>
    )
  }

  const invite = preview.data
  const inviter = inviterLabel(invite.inviterName, ROLE_NAME[invite.inviterRole])

  if (joined) {
    return (
      <main className="auth-card">
        <CompanyHead invite={invite} title={inviteWelcome(invite.companyName)} done>
          <b>{invite.email}</b>
          {INVITE_WELCOME_ROLE}
          <br />
          {INVITE_WELCOME_LEAD}
        </CompanyHead>
        <Perks title={INVITE_WELCOME_CAN} items={INVITE_PERKS.slice(0, 2)} />
        <div className="auth-stack tight">
          <Link className="auth-btn pri" to="/employer/postings">
            {INVITE_TO_POSTINGS}
          </Link>
          <Link className="auth-btn sec" to="/employer/chat">
            {INVITE_TO_AGENT}
          </Link>
        </div>
      </main>
    )
  }

  const head = (
    <CompanyHead invite={invite} title={inviteTitle(invite.companyName)}>
      {`${inviter}${INVITE_LEAD_SUBJECT}`}
      <b>{invite.email}</b>
      {INVITE_LEAD_OBJECT}
      <br />
      {INVITE_LEAD_ROLE}
    </CompanyHead>
  )

  if (mismatch) {
    return (
      <main className="auth-card">
        {head}
        <AuthAlert
          tone="orange"
          title={INVITE_OTHER_TITLE}
          detail={
            <>
              {INVITE_OTHER_NOW}
              <b>{me.data?.email || (personal ? INVITE_OTHER_PERSONAL : INVITE_OTHER_ACCOUNT)}</b>
              {INVITE_OTHER_AS}
              <b>{invite.email}</b>
              {INVITE_OTHER_NEED}
            </>
          }
        />
        <div className="auth-stack tight">
          <button
            type="button"
            className="auth-btn pri"
            onClick={() => {
              sessionStore.clear()
              saveReturnTo(`/invites/${token}`)
              navigate('/login?accountType=EMPLOYER')
            }}
          >
            {INVITE_RELOGIN}
          </button>
          <Link className="auth-btn sec" to="/">
            {INVITE_KEEP}
          </Link>
        </div>
        <p className="auth-hint center">{INVITE_LIMIT}</p>
      </main>
    )
  }

  // A signed-in employer accepts here (push-be checks the invited email); a guest signs in or up first and comes back.
  const accept = async () => {
    setAcceptError(null)
    setAccepting(true)
    try {
      await companiesAcceptInvite(token)
      const account = await authMe()
      const current = sessionStore.load()
      if (current) sessionStore.save({ ...current, user: { ...current.user, companyId: account.companyId, companyRole: account.companyRole } })
      setJoined(true)
    } catch (caught) {
      setAcceptError(caught)
    } finally {
      setAccepting(false)
    }
  }
  const viaGoogle = () => {
    if (session) return void accept()
    saveReturnTo(`/invites/${token}`)
    void oauth.start('google', 'EMPLOYER')
  }
  const viaEmail = () => {
    if (session) return void accept()
    saveSignupReturnTo(`/invites/${token}`)
    navigate(`/signup?accountType=EMPLOYER&email=${encodeURIComponent(invite.email)}`)
  }
  const busy = accepting || oauth.pending

  return (
    <main className="auth-card">
      {head}
      <Perks title={INVITE_CAN} items={INVITE_PERKS} />
      {acceptError ? (
        <p className="auth-error" role="alert">
          {INVITE_ACCEPT_FAILED}
        </p>
      ) : null}
      <div className="auth-stack tight">
        <button type="button" className={busy ? 'auth-btn line dis' : 'auth-btn line'} disabled={busy} onClick={viaGoogle}>
          <GoogleMark />
          {INVITE_GOOGLE}
        </button>
        <button type="button" className="auth-btn pri" disabled={busy} aria-busy={accepting || undefined} onClick={viaEmail}>
          {accepting ? (
            <>
              <span className="auth-spin" aria-hidden="true" />
              {INVITE_ACCEPTING}
            </>
          ) : (
            INVITE_EMAIL_ACCEPT
          )}
        </button>
      </div>
      <p className="auth-hint center">{accepting ? invitePreparing(invite.companyName) : INVITE_LIMIT}</p>
    </main>
  )
}

export default InvitePage
