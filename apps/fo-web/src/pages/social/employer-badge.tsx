import { Icon } from '../../shared/ui/icon'
import { EMPLOYER_BADGE } from './constants'

const EmployerBadge = () => (
  <span className="badge biz">
    <Icon name="company" size={12} width={2.2} />
    {EMPLOYER_BADGE}
  </span>
)

export default EmployerBadge
