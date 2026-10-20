import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { useSession } from '../../shared/auth/use-session'
import ActivityPanel from './activity-panel'
import CompanyPanel from './company-panel'
import {
  ACTIVITY_CHIP_KEY,
  EMPLOYER_ACTIVITY_CHIPS,
  EMPLOYER_MY_TABS,
  MY_TAB_KEY,
  PERSONAL_ACTIVITY_CHIPS,
  PERSONAL_MY_TABS,
} from './constants'
import DocumentsPanel from './documents-panel'
import ProfileForm from './profile-form'

const MyPage = () => {
  const session = useSession()
  const employer = session?.user.accountType === 'EMPLOYER'
  const tabs = employer ? EMPLOYER_MY_TABS : PERSONAL_MY_TABS
  const chips = employer ? EMPLOYER_ACTIVITY_CHIPS : PERSONAL_ACTIVITY_CHIPS
  const [params, setParams] = useSearchParams()
  const tab = tabs.find((label) => MY_TAB_KEY[label] === params.get('tab')) ?? tabs[0]
  const chip = chips.find((label) => ACTIVITY_CHIP_KEY[label] === params.get('chip')) ?? chips[0]
  const received = useQuery({ queryKey: ['offers', 'received'], queryFn: () => api.me.offers('received') })
  const sentCount = received.data?.data.filter((item) => item.status === 'SENT').length ?? 0
  const selectTab = (label: (typeof tabs)[number]) => {
    const next = new URLSearchParams(params)
    next.set('tab', MY_TAB_KEY[label])
    if (MY_TAB_KEY[label] !== 'activity') next.delete('chip')
    setParams(next)
  }
  const selectChip = (label: string) => {
    const key = ACTIVITY_CHIP_KEY[label as keyof typeof ACTIVITY_CHIP_KEY]
    if (!key) return
    const next = new URLSearchParams(params)
    next.set('tab', 'activity')
    next.set('chip', key)
    setParams(next)
  }
  return (
    <main className="page">
      <header className="head my-head">
        <h1 className="h1">마이</h1>
        <div className="my-links">
          <Link to="/offers">
            제안함
            {sentCount > 0 ? <span className="badge ac">{sentCount}</span> : null}
          </Link>
          <Link to="/settings">설정</Link>
        </div>
      </header>
      <div className="tabs" role="tablist">
        {tabs.map((label) => (
          <button key={label} type="button" role="tab" aria-selected={label === tab} onClick={() => selectTab(label)}>
            {label}
          </button>
        ))}
      </div>
      {tab === '프로필' ? <ProfileForm /> : null}
      {tab === '서류' ? <DocumentsPanel /> : null}
      {tab === '회사' ? <CompanyPanel /> : null}
      {tab === '내 활동' ? <ActivityPanel chips={chips} chip={chip} onChip={selectChip} /> : null}
    </main>
  )
}

export default MyPage
