import { useParams } from 'react-router-dom'

import OfferInbox from './offer-inbox'

const OffersPage = () => {
  const { id } = useParams()
  return <OfferInbox selectedId={id} />
}

export default OffersPage
