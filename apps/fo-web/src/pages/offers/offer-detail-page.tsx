import { useParams } from 'react-router-dom'
import OfferInbox from './offer-inbox'

const OfferDetailPage = () => {
  const { id = '' } = useParams()
  return <OfferInbox selectedId={id} />
}

export default OfferDetailPage
