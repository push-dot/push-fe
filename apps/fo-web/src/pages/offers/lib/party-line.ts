import type { OfferParty } from '@push/api-client'

export const partyLine = (party: Pick<OfferParty, 'companyName' | 'headline'>) => [party.companyName, party.headline].filter(Boolean).join(' · ')
