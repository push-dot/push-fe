import { ApiError, type EmployerPlan } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import {
  EMPLOYER_PLAN_CARDS,
  canChangeEmployerPlan,
  checkoutTarget,
  showEmployerCheckout,
  topupReady,
} from '../../shared/model/employer-plans'
import {
  PLAN_ACTION_FAILED,
  PLAN_ADMIN_ONLY,
  PLAN_AMOUNT,
  PLAN_CURRENT,
  PLAN_RECOMMENDED,
  PLAN_RENEWAL,
  PLAN_TOPUP,
  PLANS_LOADING,
  PLANS_PERSONAL,
  PLANS_TITLE,
  TOPUP_DONE,
  planStarted,
  remainingCredits,
} from './constants'
import PlanCard from './plan-card'

const companyMissing = (error: unknown) => error instanceof ApiError && error.status === 404

const PlansPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const [amountText, setAmountText] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const started = EMPLOYER_PLAN_CARDS.find((card) => card.id === params.get('checkout'))
  const notice = started ? planStarted(started.name) : params.get('topup') ? TOPUP_DONE : null
  const billing = useQuery({ queryKey: ['billing', 'company'], queryFn: () => api.billing.companyStatus() })
  const company = useQuery({
    queryKey: ['company', 'me'],
    queryFn: () => api.companies.me(),
    retry: (failureCount, error) => !companyMissing(error) && failureCount < 1,
  })
  const openLocal = async (url: string) => {
    await queryClient.invalidateQueries({ queryKey: ['billing', 'company'] })
    await queryClient.invalidateQueries({ queryKey: ['company', 'me'] })
    const target = checkoutTarget(url, window.location.href)
    if (target.stay) {
      navigate(target.href)
      return
    }
    location.assign(target.href)
  }
  const checkout = useMutation({
    mutationFn: (planId: EmployerPlan) => api.billing.checkout(planId),
    onSuccess: (result) => {
      void openLocal(result.url)
    },
    onError: () => {
      setActionError(PLAN_ACTION_FAILED)
    },
  })
  const topup = useMutation({
    mutationFn: (amount: number) => api.billing.topup(amount),
    onSuccess: (result) => {
      void openLocal(result.url)
    },
    onError: () => {
      setActionError(PLAN_ACTION_FAILED)
    },
  })
  const billingReady = billing.isSuccess || billing.isError
  const employerPlans = billingReady && showEmployerCheckout(billing.data?.audience)
  const companyReady = company.isSuccess || company.isError
  if (!billingReady || (employerPlans && !companyReady)) {
    return (
      <main className="page" aria-busy="true">
        <p className="b2 t3 stack">{PLANS_LOADING}</p>
      </main>
    )
  }
  if (!employerPlans) {
    return (
      <main className="page">
        <header className="head">
          <h1 className="h1">{PLANS_TITLE}</h1>
        </header>
        <p className="b1 stack">{PLANS_PERSONAL}</p>
      </main>
    )
  }
  const missing = companyMissing(company.error)
  const canManage = canChangeEmployerPlan(company.data?.role, missing)
  const amount = Number(amountText)
  const submitTopup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManage || !topupReady(amount) || topup.isPending) return
    setActionError(null)
    topup.mutate(amount)
  }
  const subscribe = (planId: EmployerPlan) => {
    if (!canManage || checkout.isPending) return
    setActionError(null)
    checkout.mutate(planId)
  }
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{PLANS_TITLE}</h1>
        {billing.data ? <p className="b1">{remainingCredits(billing.data.balanceMicroCredits)}</p> : null}
        <p className="b2 t2">{PLAN_RENEWAL}</p>
        {notice ? (
          <p className="b1" role="status">
            {notice}
          </p>
        ) : null}
      </header>
      <ul className="plan-list stack">
        {EMPLOYER_PLAN_CARDS.map((card) => (
          <PlanCard
            key={card.id}
            name={card.name}
            price={card.price}
            credits={card.credits}
            blurb={card.blurb}
            badges={[
              ...(card.id === billing.data?.plan ? [PLAN_CURRENT] : []),
              ...(card.id === 'ULTRA' ? [PLAN_RECOMMENDED] : []),
            ]}
            pending={checkout.isPending}
            onSubscribe={canManage ? () => subscribe(card.id) : undefined}
          />
        ))}
      </ul>
      {actionError ? (
        <p className="auth-error stack" role="alert">
          {actionError}
        </p>
      ) : null}
      {canManage ? (
        <form className="stack form" onSubmit={submitTopup}>
          <label className="field">
            <span>{PLAN_AMOUNT}</span>
            <input type="number" inputMode="decimal" value={amountText} onChange={(event) => setAmountText(event.target.value)} />
          </label>
          <button type="submit" className="primary" disabled={!topupReady(amount) || topup.isPending}>
            {PLAN_TOPUP}
          </button>
        </form>
      ) : company.data?.role === 'MEMBER' ? (
        <p className="b2 stack">{PLAN_ADMIN_ONLY}</p>
      ) : null}
    </main>
  )
}

export default PlansPage
