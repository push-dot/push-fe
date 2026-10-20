import { ApiError, type CompanyMember } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useSession } from '../../shared/auth/use-session'
import { canInvite } from '../../shared/model/employer-plan'
import Toast, { useToast } from '../../shared/ui/toast'
import {
  COMPANY_MISSING,
  VERIFY_LINK,
  INVITE_EMAIL,
  INVITE_FAILED_SEND,
  INVITE_SENT,
  INVITE_SUBMIT,
  MEMBERS_FAILED,
  MEMBERS_LOADING,
  MEMBERS_TITLE,
  ROLE_ADMIN,
  ROLE_MEMBER,
  seatCount,
} from './constants'
import { inviteHint } from './invite-hint'
import MemberRow from './member-row'

const MembersPage = () => {
  const session = useSession()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [seatError, setSeatError] = useState<string | null>(null)
  const companyQuery = useQuery({ queryKey: ['company', 'me'], queryFn: () => api.companies.me() })
  const membersQuery = useQuery({ queryKey: ['company', 'members'], queryFn: () => api.companies.members() })
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['company', 'me'] })
    await queryClient.invalidateQueries({ queryKey: ['company', 'members'] })
  }
  const invite = useMutation({
    mutationFn: (next: string) => api.companies.invite(next),
    onSuccess: async () => {
      setEmail('')
      setSeatError(null)
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
    mutationFn: (userId: string) => api.companies.removeMember(userId),
    onSuccess: () => refresh(),
  })
  const transfer = useMutation({
    mutationFn: (userId: string) => api.companies.transferAdmin(userId),
    onSuccess: () => refresh(),
  })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = email.trim()
    if (!next || invite.isPending) return
    invite.mutate(next)
  }
  if (companyQuery.isError || membersQuery.isError) {
    const missing = companyQuery.error instanceof ApiError && companyQuery.error.code === 'COMPANY_NOT_FOUND'
    return (
      <main className="page">
        <header className="head">
          <h1 className="h1">{MEMBERS_TITLE}</h1>
        </header>
        <p className="b1 stack">{missing ? COMPANY_MISSING : MEMBERS_FAILED}</p>
        {missing ? (
          <Link className="text-link stack" to="/employer/verify">
            {VERIFY_LINK}
          </Link>
        ) : null}
      </main>
    )
  }
  if (!companyQuery.data || !membersQuery.data) {
    return (
      <main className="page" aria-busy="true">
        <p className="b2 t3 stack">{MEMBERS_LOADING}</p>
      </main>
    )
  }
  const company = companyQuery.data
  const isAdmin = company.role === 'ADMIN'
  const allowInvite = isAdmin && canInvite(company.plan, company.seats.used)
  const hint = inviteHint(company.plan, company.seats.used, isAdmin)
  const pending = remove.isPending || transfer.isPending
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{MEMBERS_TITLE}</h1>
        <p className="b1">{seatCount(company.seats.used, company.seats.limit)}</p>
      </header>
      <ul className="activity-list stack">
        {membersQuery.data.map((member: CompanyMember) => (
          <MemberRow
            key={member.userId}
            email={member.email}
            roleLabel={member.role === 'ADMIN' ? ROLE_ADMIN : ROLE_MEMBER}
            showActions={isAdmin && member.userId !== session?.user.id}
            pending={pending}
            onRemove={() => remove.mutate(member.userId)}
            onTransfer={() => transfer.mutate(member.userId)}
          />
        ))}
      </ul>
      {allowInvite ? (
        <form className="stack form" onSubmit={submit}>
          <label className="field">
            <span>{INVITE_EMAIL}</span>
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {seatError ? (
            <p className="auth-error" role="alert">
              {seatError}
            </p>
          ) : null}
          <button type="submit" className="primary" disabled={email.trim().length === 0 || invite.isPending}>
            {INVITE_SUBMIT}
          </button>
        </form>
      ) : hint ? (
        <p className="b2 stack">{hint}</p>
      ) : null}
      <Toast message={toast.message} />
    </main>
  )
}

export default MembersPage
