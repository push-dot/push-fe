import { isWebView } from '../lib/bridge'
import { LoadFail } from './page-state'

const Status = ({ error, what }: { error: boolean; what: string }) => {
  if (error && !isWebView()) return <LoadFail />
  return (
    <main className="status b2 t3" aria-busy={!error}>
      {error ? `${what}를 불러오지 못했어요` : null}
    </main>
  )
}

export default Status
