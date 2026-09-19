export type BillingSummary = {
  subscriptionStatus: string
  plan: string
  periodEndsAt: string | null
  balanceMicroCredits: number
  reservedMicroCredits: number
}
