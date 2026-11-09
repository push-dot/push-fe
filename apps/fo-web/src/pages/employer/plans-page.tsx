import { ApiError, type EmployerPlan } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  EMPLOYER_PLAN_CARDS,
  canChangeEmployerPlan,
  checkoutTarget,
  paymentsOpen,
  showEmployerCheckout,
} from '../../shared/model/employer-plans'
import {
  PAYMENTS_CLOSED,
  PLAN_BLURB,
  PLAN_CANCELED_BODY,
  PLAN_CANCELED_TITLE,
  PLAN_FEATURES,
  PLAN_LEAD,
  PLAN_NOTE,
  PLAN_SECURE,
  PLAN_VIEWER_TITLE,
  PLANS_LOADING,
  PLANS_PERSONAL,
  PLANS_TITLE,
  TOPUP_DONE,
  planActionError,
  planPaid,
  planSwitchLabel,
  planUsedPercent,
  planViewerBody,
} from './constants'
import MySide from '../my/my-side'
import PlanCard from './plan-card'
import PlanUsage from './plan-usage'
import { BuyDialog, LedgerDialog } from './plan-dialogs'
import { useCompanyBilling } from '../../entities/billing'
import { useMyCompany } from '../../entities/company'
import { useCompanyMembers } from '../../entities/member'
import { billingCheckout, billingTopup } from '../../features/checkout-plan'
import Toast, { useToast } from '../../shared/ui/toast'
import { Icon } from '../../shared/ui/icon'

const companyMissing = (error: unknown) => error instanceof ApiError && error.status === 404

const PlanBanner = ({ title, body }: { title: string; body: string }) => (
  <div className="plan-banner" role="status">
    <Icon name="info" size={20} />
    <div>
      <p className="b2 w7">{title}</p>
      <p className="c1 t2">{body}</p>
    </div>
  </div>
)

const PlansPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'buy' | 'history' | null>(null)
  const toast = useToast()
  const checkoutParam = params.get('checkout')
  const started = EMPLOYER_PLAN_CARDS.find((card) => card.id === checkoutParam)
  // push-be returns a top-up to ?checkout=credits; the mock still uses ?topup=<packs>.
  const toppedUp = checkoutParam === 'credits' || params.has('topup')
  useEffect(() => {
    if (started) toast.show(planPaid(started.name))
    else if (toppedUp) toast.show(TOPUP_DONE)
  }, [started, toppedUp, toast.show])
  const billing = useCompanyBilling()
  const company = useMyCompany({
    retry: (failureCount, error) => !companyMissing(error) && failureCount < 1,
  })
  const viewer = company.data?.role === 'MEMBER'
  const members = useCompanyMembers({ enabled: viewer })
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
    onError: (error) => {
      setActionError(planActionError(error))
    },
  })
  const topup = useMutation({
    mutationFn: (packs: number) => billingTopup(packs),
    onSuccess: (result) => {
      setDialog(null)
      void openLocal(result.url)
    },
    onError: (error) => {
      setActionError(planActionError(error))
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
  const open = paymentsOpen(billing.data)
  const canPay = canManage && open
  const subscribe = (planId: EmployerPlan) => {
    if (!canPay || checkout.isPending) return
    setActionError(null)
    checkout.mutate(planId)
  }
  const currentPlan = billing.data?.plan ?? null
  const rank = { BASIC: 0, PRO: 1, ULTRA: 2 } as const
  const percent = planUsedPercent(billing.data?.spentMicroCredits ?? 0, billing.data?.monthlyMicroCredits ?? 0)
  const admin = members.data?.find((member) => member.role === 'ADMIN')
  return (
    <main className="page my-layout">
      <MySide />
      <div className="my-main plan-main">
        <h1 className="h1">{PLANS_TITLE}</h1>
        {checkoutParam === 'canceled' ? <PlanBanner title={PLAN_CANCELED_TITLE} body={PLAN_CANCELED_BODY} /> : null}
        {viewer ? <PlanBanner title={PLAN_VIEWER_TITLE} body={planViewerBody(admin?.displayName)} /> : null}
        {billing.data && !open ? (
          <p className="b1" role="status">
            {PAYMENTS_CLOSED}
          </p>
        ) : null}
        <PlanUsage
          percent={percent}
          buy={open ? (canPay ? 'on' : 'off') : 'hidden'}
          onHistory={() => setDialog('history')}
          onBuy={() => {
            setActionError(null)
            setDialog('buy')
          }}
        />
        <h2 className="h2 plan-lead">{PLAN_LEAD}</h2>
        <ul className="plan-grid">
          {EMPLOYER_PLAN_CARDS.map((card) => (
            <PlanCard
              key={card.id}
              name={card.name}
              price={card.price}
              blurb={PLAN_BLURB[card.id]}
              features={PLAN_FEATURES[card.id]}
              featured={card.id === 'ULTRA'}
              current={card.id === currentPlan}
              action={planSwitchLabel(card.name, card.id === currentPlan, currentPlan ? rank[card.id] > rank[currentPlan] : false, currentPlan !== null)}
              disabled={!canPay || checkout.isPending}
              onSubscribe={() => subscribe(card.id)}
            />
          ))}
        </ul>
        {actionError && dialog !== 'buy' ? (
          <p className="auth-error" role="alert">
            {actionError}
          </p>
        ) : null}
        <p className="c1 t3">{PLAN_NOTE}</p>
        <p className="c1 t3 plan-secure">
          <Icon name="lock" size={14} />
          {PLAN_SECURE}
        </p>
      </div>
      {dialog === 'history' ? <LedgerDialog company={company.data?.name ?? ''} onClose={() => setDialog(null)} /> : null}
      {dialog === 'buy' && canPay ? (
        <BuyDialog
          pending={topup.isPending}
          error={actionError}
          onSubmit={(packs) => {
            setActionError(null)
            topup.mutate(packs)
          }}
          onClose={() => setDialog(null)}
        />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </main>
  )
}

export default PlansPage
