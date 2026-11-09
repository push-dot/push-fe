import { ApiError, type CompanyMember } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useMyCompany } from '../../entities/company'
import { useCompanyMembers } from '../../entities/member'
import { companiesRemoveMember, companiesTransferAdmin, inviteHint } from '../../features/invite-member'
import { useSession } from '../../shared/auth/use-session'
import { PLAN_NAME, canInvite } from '../../shared/model/employer-plan'
import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import Toast, { useToast } from '../../shared/ui/toast'
import MySide from '../my/my-side'
import {
  COMPANY_MISSING,
  INVITE_DIALOG_TITLE,
  INVITE_SENT,
  MEMBERS_ACTION_FAILED,
  MEMBERS_ADMIN_CAN,
  MEMBERS_FAILED,
  MEMBERS_LOADING,
  MEMBERS_MEMBER_CAN,
  MEMBERS_PERM_TITLE,
  MEMBERS_TITLE,
  REMOVE_MEMBER,
  ROLE_ADMIN,
  ROLE_MEMBER,
  SEAT_FULL_PLANS,
  SEAT_FULL_TITLE,
  TRANSFER_CONFIRM,
  VERIFY_LINK,
  adminOnlyNote,
  removeBody,
  removeTitle,
  seatCount,
  seatFullBody,
  seatPlan,
  transferBody,
  transferTitle,
} from './constants'
import InviteDialog from './invite-dialog'
import MemberRow from './member-row'

type Pending = { kind: 'remove' | 'transfer'; member: CompanyMember }

const MembersPage = () => {
  const session = useSession()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [inviting, setInviting] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const companyQuery = useMyCompany()
  const membersQuery = useCompanyMembers()
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['company', 'me'] })
    await queryClient.invalidateQueries({ queryKey: ['company', 'members'] })
  }
  const change = useMutation({
    mutationFn: ({ kind, member }: Pending) => (kind === 'remove' ? companiesRemoveMember(member.userId) : companiesTransferAdmin(member.userId)),
    onSuccess: refresh,
    onError: () => toast.show(MEMBERS_ACTION_FAILED, { tone: 'err' }),
    onSettled: () => setPending(null),
  })
  const frame = (body: ReactNode) => (
    <main className="page my-layout">
      <MySide />
      <div className="my-main member-main">{body}</div>
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
  const members = membersQuery.data
  const isAdmin = company.role === 'ADMIN'
  const full = !canInvite(company.plan, company.seats.used)
  const plan = seatPlan(company.plan)
  const hint = isAdmin && !plan ? inviteHint(company.plan, company.seats.used, true) : null
  const adminEmail = members.find((member) => member.role === 'ADMIN')?.email ?? ''
  const label = pending?.member.email ?? ''
  return frame(
    <>
      <h1 className="h1">{MEMBERS_TITLE}</h1>
      <div className="member-bar">
        <p className="b2 t3">{seatCount(company.seats.used, company.seats.limit, company.plan ? PLAN_NAME[company.plan] : null)}</p>
        {isAdmin ? (
          <button type="button" className="btn pri sm" disabled={full} onClick={() => setInviting(true)}>
            <Icon name="plus" size={16} width={2.4} />
            {INVITE_DIALOG_TITLE}
          </button>
        ) : null}
      </div>
      {isAdmin && full && plan ? (
        <div className="seat-banner">
          <span className="red">
            <Icon name="warn" size={20} />
          </span>
          <span className="seat-copy">
            <span className="b2 w7">{SEAT_FULL_TITLE}</span>
            <span className="c1 t2">{seatFullBody(plan)}</span>
          </span>
          <Link className="btn sec sm" to="/employer/plans">
            {SEAT_FULL_PLANS}
          </Link>
        </div>
      ) : null}
      {hint ? <p className="b2 t3">{hint}</p> : null}
      {isAdmin ? null : (
        <p className="member-info c1 t2">
          <Icon name="info" size={18} className="t3" />
          <span>{adminOnlyNote(adminEmail)}</span>
        </p>
      )}
      <ul className="member-list box">
        {members.map((member: CompanyMember) => {
          const own = member.userId === session?.user.id
          return (
            <MemberRow
              key={member.userId}
              email={member.email}
              roleLabel={member.role === 'ADMIN' ? ROLE_ADMIN : ROLE_MEMBER}
              admin={member.role === 'ADMIN'}
              self={own}
              showActions={isAdmin && !own}
              pending={change.isPending}
              onRemove={() => setPending({ kind: 'remove', member })}
              onTransfer={() => setPending({ kind: 'transfer', member })}
            />
          )
        })}
      </ul>
      <section className="card perm">
        <p className="b2 w7">{MEMBERS_PERM_TITLE}</p>
        <p className="c1 t2">
          <b>{ROLE_ADMIN}</b> · {MEMBERS_ADMIN_CAN}
          <br />
          <b>{ROLE_MEMBER}</b> · {MEMBERS_MEMBER_CAN}
        </p>
      </section>
      {inviting && isAdmin ? (
        <InviteDialog
          company={company}
          refresh={refresh}
          onClose={() => setInviting(false)}
          onSent={() => {
            setInviting(false)
            toast.show(INVITE_SENT)
          }}
        />
      ) : null}
      {pending?.kind === 'remove' ? (
        <ConfirmDialog
          title={removeTitle(label)}
          body={removeBody(company.name, label)}
          confirmLabel={REMOVE_MEMBER}
          danger
          busy={change.isPending}
          onConfirm={() => change.mutate(pending)}
          onClose={() => setPending(null)}
        />
      ) : null}
      {pending?.kind === 'transfer' ? (
        <ConfirmDialog
          title={transferTitle(label)}
          body={transferBody(label, session?.user.displayName ?? '')}
          confirmLabel={TRANSFER_CONFIRM}
          busy={change.isPending}
          onConfirm={() => change.mutate(pending)}
          onClose={() => setPending(null)}
        />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} />
    </>,
  )
}

export default MembersPage
