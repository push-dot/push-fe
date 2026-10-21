import type { ReactNode } from 'react'

import { creditCount, creditText, useCompanyBilling } from '../../entities/billing'
import { useEmployerPlan } from '../../entities/company'
import { useEmployerConversations } from '../../entities/conversation'
import { PLAN_NAME } from '../../shared/model/employer-plan'
import { EMPLOYER_PLAN_CARDS } from '../../shared/model/employer-plans'
import ChatSide from './chat-side'


const ChatApp = ({ activeId, children }: { activeId?: string; children: ReactNode }) => {
  const { plan } = useEmployerPlan()
  const conversations = useEmployerConversations()
  const billing = useCompanyBilling()
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
