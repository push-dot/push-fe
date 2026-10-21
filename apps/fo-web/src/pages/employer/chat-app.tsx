import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { api } from '../../api'
import { EMPLOYER_PLAN_CARDS } from '../../shared/model/employer-plans'
import { PLAN_NAME } from '../../shared/model/employer-plan'
import ChatSide from './chat-side'
import { creditCount, creditText } from './credit-count'
import { useEmployerPlan } from './use-employer-plan'

const ChatApp = ({ activeId, children }: { activeId?: string; children: ReactNode }) => {
  const { plan } = useEmployerPlan()
  const conversations = useQuery({ queryKey: ['employer-conversations'], queryFn: () => api.conversations.list({ audience: 'EMPLOYER' }) })
  const billing = useQuery({ queryKey: ['billing', 'company'], queryFn: () => api.billing.companyStatus() })
  const card = EMPLOYER_PLAN_CARDS.find((item) => item.id === plan)
  const allowance = card ? Number(card.credits.replaceAll(',', '')) : 0
  const remain = creditCount(billing.data?.balanceMicroCredits ?? 0)
  const ratio = allowance > 0 ? Math.max(0, Math.min(100, Math.round((remain / allowance) * 100))) : 0
  const usage = billing.data
    ? {
        plan: plan ? `기업 ${PLAN_NAME[plan]}` : '기업',
        remain: creditText(remain),
        allowance: allowance ? creditText(allowance) : '',
        ratio,
      }
    : null
  return (
    <main className="chat-app-main">
      <ChatSide conversations={conversations.data?.data ?? []} activeId={activeId} loading={!conversations.data && !conversations.isError} failed={conversations.isError} usage={usage} />
      <section className="chat-thread">{children}</section>
    </main>
  )
}

export default ChatApp
