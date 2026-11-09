import { NavLink } from 'react-router-dom'
import { Icon } from '../../shared/ui/icon'
import { LEGAL_BODY_PENDING, LEGAL_EFFECTIVE, LEGAL_PENDING, LEGAL_SECTIONS, LEGAL_TABS, LEGAL_TITLE, type LegalKind } from './constants'

const BARS = [100, 96, 72]

const LegalPage = ({ kind }: { kind: LegalKind }) => (
  <main className="page legal">
    <article>
      <nav className="tabs" aria-label="약관">
        {LEGAL_TABS.map((tab) => (
          <NavLink key={tab.kind} to={tab.to} className={tab.kind === kind ? 'on' : undefined}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <h1 className="h1">{LEGAL_TITLE[kind]}</h1>
      <p className="b2 t3 num legal-date">{LEGAL_EFFECTIVE}</p>
      <p className="card legal-note b2 t2">
        <Icon name="info" size={18} className="t3" />
        {LEGAL_PENDING}
      </p>
      <div className="legal-body">
        {LEGAL_SECTIONS[kind].map((title) => (
          <section key={title} className="legal-section">
            <h2 className="h3">{title}</h2>
            <p className="b2 t4">{LEGAL_BODY_PENDING}</p>
            <span className="legal-bars" aria-hidden="true">
              {BARS.map((width) => (
                <i key={width} style={{ width: `${width}%` }} />
              ))}
            </span>
          </section>
        ))}
      </div>
    </article>
  </main>
)

export default LegalPage
