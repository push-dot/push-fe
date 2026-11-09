import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../shared/ui/icon'
import { tabItems, tabOn } from './tab-items'

const TabBar = ({ kind }: { kind: 'guest' | 'personal' | 'employer' }) => {
  const { pathname } = useLocation()
  return (
    <nav className="mtab" aria-label="메뉴">
      {tabItems(kind).map((item) => {
        const on = tabOn(pathname, item.to)
        return (
          <Link key={item.to} to={item.to} className={on ? 'on' : undefined} aria-current={on ? 'page' : undefined}>
            <Icon name={item.icon} size={24} width={on ? 2.2 : 1.8} filled={on && item.icon === 'home'} />
            {item.label}
            {item.lock ? <Icon name="lock" size={12} width={2.4} className="lk" /> : null}
          </Link>
        )
      })}
    </nav>
  )
}

export default TabBar
