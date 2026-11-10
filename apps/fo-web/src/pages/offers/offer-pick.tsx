import StateBlock from '../../shared/ui/state-block'
import { OFFER_PICK, OFFER_PICK_HINT } from './constants'

const OfferPick = () => (
  <section className="inbox-pick">
    <StateBlock icon="chat" title={OFFER_PICK} description={OFFER_PICK_HINT} />
  </section>
)

export default OfferPick
