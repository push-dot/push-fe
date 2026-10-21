import { ApiError, type CompanyMember } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useSession } from '../../shared/auth/use-session'
import { PLAN_NAME, canInvite } from '../../shared/model/employer-plan'
import Toast, { useToast } from '../../shared/ui/toast'
import MySide from '../my/my-side'
import {
  COMPANY_MISSING,
  INVITE_CANCEL,
  INVITE_DIALOG_TITLE,
  INVITE_EMAIL,
  INVITE_FAILED_SEND,
  INVITE_SENT,
  INVITE_SUBMIT,
  MEMBERS_ADMIN_CAN,
  MEMBERS_FAILED,
  MEMBERS_LOADING,
  MEMBERS_MEMBER_CAN,
  MEMBERS_TITLE,
  ROLE_ADMIN,
  ROLE_MEMBER,
  VERIFY_LINK,
  inviteLead,
  inviteLimitCopy,
  seatCount,
} from './constants'
import { inviteHint } from './invite-hint'
import MemberRow from './member-row'
import { useMyCompany } from '../../entities/company'
import { useCompanyMembers } from '../../entities/member'
import { companiesInvite, companiesRemoveMember, companiesTransferAdmin } from '../../shared/api/operations'


const MembersPage = () => {
  const session = useSession()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [seatError, setSeatError] = useState<string | null>(null)
  const companyQuery = useMyCompany()
  const membersQuery = useCompanyMembers()
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['company', 'me'] })
    await queryClient.invalidateQueries({ queryKey: ['company', 'members'] })
  }
  const invite = useMutation({
    mutationFn: (next: string) => companiesInvite(next),
    onSuccess: async () => {
      setEmail('')
      setSeatError(null)
      setInviting(false)
      toast.show(INVITE_SENT)
      await refresh()
    },
    onError: async (error) => {
      const company = companyQuery.data
      if (error instanceof ApiError && error.status === 403 && error.code === 'SEAT_LIMIT' && company) {
        setSeatError(inviteHint(company.plan, company.seats.used, true))
        await refresh()
        return
      }
      setSeatError(INVITE_FAILED_SEND)
    },
  })
  const remove = useMutation({
    mutationFn: (userId: string) => companiesRemoveMember(userId),
    onSuccess: () => refresh(),
  })
  const transfer = useMutation({
    mutationFn: (userId: string) => companiesTransferAdmin(userId),
    onSuccess: () => refresh(),
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = email.trim()
    if (!next || invite.isPending) return
    invite.mutate(next)
  }
  const frame = (body: ReactNode) => (
    <main className="page my-layout">
      <MySide />
      <div className="my-main">{body}</div>
    </main>
  )
  if (companyQuery.isError || membersQuery.isError) {
    const missing = companyQuery.error instanceof ApiError && companyQuery.error.code === 'COMPANY_NOT_FOUND'
    return frame(
      <>
        <h1 className="h1">{MEMBERS_TITLE}</h1>
        <p className="b1">{missing ? COMPANY_MISSING : MEMBERS_FAILED}</p>
        {missing ? (
          <Link className="text-link" to="/employer/verify">
            {VERIFY_LINK}
          </Link>
        ) : null}
      </>,
    )
  }
  if (!companyQuery.data || !membersQuery.data) {
    return frame(
      <p className="b2 t3" aria-busy="true">
        {MEMBERS_LOADING}
      </p>,
    )
  }
  const company = companyQuery.data
  const isAdmin = company.role === 'ADMIN'
  const allowInvite = isAdmin && canInvite(company.plan, company.seats.used)
  const hint = inviteHint(company.plan, company.seats.used, isAdmin)
  const pending = remove.isPending || transfer.isPending
  return frame(
    <>
      <header className="head biz-bar">
        <span>
          <h1 className="h1">{MEMBERS_TITLE}</h1>
          <p className="b1">{seatCount(company.seats.used, company.seats.limit, company.plan ? PLAN_NAME[company.plan] : null)}</p>
        </span>
        {allowInvite ? (
          <button type="button" className="btn pri" onClick={() => setInviting(true)}>
            {INVITE_DIALOG_TITLE}
          </button>
        ) : null}
      </header>
      <ul className="member-list">
        {membersQuery.data.map((member: CompanyMember) => (
          <MemberRow
            key={member.userId}
            email={member.email}
            roleLabel={member.role === 'ADMIN' ? ROLE_ADMIN : ROLE_MEMBER}
            admin={member.role === 'ADMIN'}
            self={member.userId === session?.user.id}
            showActions={isAdmin && member.userId !== session?.user.id}
            pending={pending}
            onRemove={() => remove.mutate(member.userId)}
            onTransfer={() => transfer.mutate(member.userId)}
          />
        ))}
      </ul>
      {hint ? <p className="b2">{hint}</p> : null}
      <section className="perm">
        <p className="c1 t2">{MEMBERS_ADMIN_CAN}</p>
        <p className="c1 t2">{MEMBERS_MEMBER_CAN}</p>
      </section>
      {inviting && allowInvite ? (
        <div className="sheet-scrim" role="presentation" onClick={() => setInviting(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={INVITE_DIALOG_TITLE} onClick={(event) => event.stopPropagation()}>
            <div className="sheet-head">
              <h2 className="h3">{INVITE_DIALOG_TITLE}</h2>
            </div>
            <p className="b2 t2">{inviteLead(company.name)}</p>
            <form className="biz-form" onSubmit={submit}>
              <label className="biz-field">
                <span>{INVITE_EMAIL}</span>
                <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <p className="c1 t3">{inviteLimitCopy(company.seats.used, company.seats.limit)}</p>
              {seatError ? (
                <p className="auth-error" role="alert">
                  {seatError}
                </p>
              ) : null}
              <div className="sheet-actions">
                <button type="button" className="btn sec" onClick={() => setInviting(false)}>
                  {INVITE_CANCEL}
                </button>
                <button type="submit" className="btn pri" disabled={email.trim().length === 0 || invite.isPending}>
                  {INVITE_SUBMIT}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <Toast message={toast.message} />
    </>,
  )
}

export default MembersPage
