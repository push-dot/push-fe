import { ApiError, type EmployerPlan } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

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
  PLAN_DEPTH,
  PLAN_FEATURES,
  PLAN_RENEWAL,
  PLAN_TOPUP,
  PLANS_LOADING,
  PLANS_PERSONAL,
  PLANS_TITLE,
  TOPUP_DONE,
  planStarted,
  planSwitchLabel,
  remainingCredits,
} from './constants'
import { PLAN_NAME } from '../../shared/model/employer-plan'
import MySide from '../my/my-side'
import PlanCard from './plan-card'
import { useCompanyBilling } from '../../entities/billing'
import { useMyCompany } from '../../entities/company'
import { billingCheckout, billingTopup } from '../../features/checkout-plan'


const companyMissing = (error: unknown) => error instanceof ApiError && error.status === 404

const PlansPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const [amountText, setAmountText] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const started = EMPLOYER_PLAN_CARDS.find((card) => card.id === params.get('checkout'))
  const notice = started ? planStarted(started.name) : params.get('topup') ? TOPUP_DONE : null
  const billing = useCompanyBilling()
  const company = useMyCompany({
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
    mutationFn: (planId: EmployerPlan) => billingCheckout(planId),
    onSuccess: (result) => {
      void openLocal(result.url)
    },
    onError: () => {
      setActionError(PLAN_ACTION_FAILED)
    },
  })
  const topup = useMutation({
    mutationFn: (amount: number) => billingTopup(amount),
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
      <main className="page my-layout" aria-busy="true">
        <MySide />
        <p className="b2 t3">{PLANS_LOADING}</p>
      </main>
    )
  }
  if (!employerPlans) {
    return (
      <main className="page my-layout">
        <MySide />
        <div className="my-main">
          <h1 className="h1">{PLANS_TITLE}</h1>
          <p className="b1">{PLANS_PERSONAL}</p>
        </div>
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
  const currentPlan = billing.data?.plan ?? null
  const rank = { BASIC: 0, PRO: 1, ULTRA: 2 } as const
  return (
    <main className="page my-layout">
      <MySide />
      <div className="my-main">
      <header className="head">
        <h1 className="h1">{PLANS_TITLE}</h1>
        {billing.data ? (
          <p className="b1">
            {remainingCredits(billing.data.balanceMicroCredits)}
            {currentPlan ? ` / ${EMPLOYER_PLAN_CARDS.find((card) => card.id === currentPlan)?.credits ?? ''}` : ''}
            {` · ${PLAN_DEPTH}`}
          </p>
        ) : null}
        <p className="b2 t2">{PLAN_RENEWAL}</p>
        {notice ? (
          <p className="b1" role="status">
            {notice}
          </p>
        ) : null}
      </header>
      <ul className="plan-grid">
        {EMPLOYER_PLAN_CARDS.map((card) => (
          <PlanCard
            key={card.id}
            name={card.name}
            price={card.price}
            credits={card.credits}
            blurb={card.blurb}
            features={PLAN_FEATURES[card.id]}
            current={card.id === currentPlan}
            action={planSwitchLabel(card.name, card.id === currentPlan, currentPlan ? rank[card.id] > rank[currentPlan] : false, currentPlan !== null)}
            pending={checkout.isPending}
            onSubscribe={canManage && card.id !== currentPlan ? () => subscribe(card.id) : undefined}
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
      {currentPlan ? <p className="c1 t3">{`${PLAN_NAME[currentPlan]} · 요금제는 기업 AI에만 적용돼요.`}</p> : null}
      </div>
    </main>
  )
}

export default PlansPage
