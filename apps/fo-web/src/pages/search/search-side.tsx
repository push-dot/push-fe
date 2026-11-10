import { isMock } from '../../shared/lib/bridge'
import { Icon } from '../../shared/ui/icon'
import { SEARCH_RECENT_CLEAR, SEARCH_RECENT_TITLE, TRENDING_SEARCHES, TRENDING_TITLE } from './constants'

type SearchSideProps = { recent: string[]; onPick: (term: string) => void; onRemove: (term: string) => void; onClear: () => void }

const SearchSide = ({ recent, onPick, onRemove, onClear }: SearchSideProps) => (
  <aside className="search-side">
    {recent.length > 0 ? (
      <section className="card search-panel">
        <div className="recent-head b2">
          <h2 className="b2 w7">{SEARCH_RECENT_TITLE}</h2>
          <button type="button" className="c1" onClick={onClear}>
            {SEARCH_RECENT_CLEAR}
          </button>
        </div>
        <div className="skill-row">
          {recent.map((term) => (
            <span key={term} className="chip search-chip">
              <button type="button" onClick={() => onPick(term)}>
                {term}
              </button>
              <button type="button" aria-label={`${term} 삭제`} onClick={() => onRemove(term)}>
                <Icon name="close" size={12} width={3} />
              </button>
            </span>
          ))}
        </div>
      </section>
    ) : null}
    {isMock() ? (
      <section className="card search-panel trend-panel">
        <h2 className="b2 w7">{TRENDING_TITLE}</h2>
        <ol className="trend">
          {TRENDING_SEARCHES.map((term, index) => (
            <li key={term}>
              <button type="button" className="b2" onClick={() => onPick(term)}>
                <span className={index < 3 ? 'w8 ac num' : 'w8 t3 num'}>{index + 1}</span>
                {term}
              </button>
            </li>
          ))}
        </ol>
      </section>
    ) : null}
  </aside>
)

export default SearchSide
