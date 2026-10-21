import { useSearchParams } from 'react-router-dom'
import { useSession } from '../../shared/auth/use-session'
import ActivityPanel from './activity-panel'
import CompanyPanel from './company-panel'
import { ACTIVITY_CHIP_KEY, EMPLOYER_ACTIVITY_CHIPS, EMPLOYER_MY_TABS, MY_TAB_KEY, PERSONAL_ACTIVITY_CHIPS, PERSONAL_MY_TABS } from './constants'
import DocumentsPanel from './documents-panel'
import LinksPanel from './links-panel'
import MySide from './my-side'
import ProfileForm from './profile-form'

const MyPage = () => {
  const session = useSession()
  const employer = session?.user.accountType === 'EMPLOYER'
  const tabs = employer ? EMPLOYER_MY_TABS : PERSONAL_MY_TABS
  const chips = employer ? EMPLOYER_ACTIVITY_CHIPS : PERSONAL_ACTIVITY_CHIPS
  const [params] = useSearchParams()
  const links = !employer && params.get('tab') === 'links'
  const tab = tabs.find((label) => MY_TAB_KEY[label] === params.get('tab')) ?? tabs[0]
  const chip = chips.find((label) => ACTIVITY_CHIP_KEY[label] === params.get('chip')) ?? chips[0]
  const title = links ? '내 링크' : tab === '내 활동' ? chip : tab
  return (
    <main className="page my-layout">
      <MySide />
      <div className="my-main">
        <h1 className="h1">{title}</h1>
        {links ? <LinksPanel /> : null}
        {!links && tab === '프로필' ? <ProfileForm /> : null}
        {!links && tab === '서류' ? <DocumentsPanel /> : null}
        {!links && tab === '회사 정보' ? <CompanyPanel /> : null}
        {!links && tab === '내 활동' ? <ActivityPanel chip={chip} /> : null}
      </div>
    </main>
  )
}

export default MyPage
