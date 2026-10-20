import type { PlanCardDef } from './types'

export const PLAN_CARDS: PlanCardDef[] = [
  {
    id: 'FREE',
    nameKey: 'plan.current',
    priceKey: null,
    featureKeys: ['plan.freeFeat1', 'plan.freeFeat2'],
  },
  {
    id: 'PRO',
    nameKey: 'plan.proName',
    priceKey: 'plan.proPrice',
    featureKeys: ['plan.proFeat1', 'plan.proFeat2', 'plan.proFeat3'],
  },
  {
    id: 'ULTRA',
    nameKey: 'plan.ultraName',
    priceKey: 'plan.ultraPrice',
    featureKeys: ['plan.ultraFeat1', 'plan.ultraFeat2', 'plan.ultraFeat3'],
  },
]

export const PLAN_RANK = { FREE: 0, PRO: 1, ULTRA: 2 } as const
