import { useNavigate } from 'react-router-dom'
import { PageState } from '../../shared/ui/page-state'
import { NOT_FOUND } from './constants'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <PageState top={<span className="nf-code num">404</span>} title={NOT_FOUND.title} body={NOT_FOUND.body}>
      <button type="button" className="btn sec" onClick={() => navigate(-1)}>
        {NOT_FOUND.back}
      </button>
      <button type="button" className="btn pri" onClick={() => navigate('/')}>
        {NOT_FOUND.home}
      </button>
    </PageState>
  )
}

export default NotFoundPage
