import { NavLink } from 'react-router-dom'
import { legalEffectiveLabel, type LegalBlock } from '@push/shared'
import { LEGAL_DOC, LEGAL_TABS, type LegalKind } from './constants'

const Block = ({ block, label }: { block: LegalBlock; label: string }) => {
  if (block.kind === 'paragraph') return <p className="b2 t2">{block.text}</p>
  if (block.kind === 'list') {
    const List = block.ordered ? 'ol' : 'ul'
    return (
      <List className="legal-list b2 t2">
        {block.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </List>
    )
  }
  return (
    // The wrapper scrolls sideways on narrow screens, so keyboard users can focus it.
    <div className="biz-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table className="biz-table legal-table b2 t2">
        <thead>
          <tr>
            {block.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) => (
                <td key={column}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Names each table region; a section with several tables numbers them so the names stay unique.
const tableLabel = (heading: string, blocks: readonly LegalBlock[], block: LegalBlock) => {
  const tables: readonly LegalBlock[] = blocks.filter((item) => item.kind === 'table')
  return tables.length > 1 ? `${heading} 표 ${tables.indexOf(block) + 1}` : `${heading} 표`
}

const LegalPage = ({ kind }: { kind: LegalKind }) => {
  const doc = LEGAL_DOC[kind]
  return (
    <main className="page legal">
      <article>
        <nav className="tabs" aria-label="약관">
          {LEGAL_TABS.map((tab) => (
            <NavLink key={tab.kind} to={tab.to} className={tab.kind === kind ? 'on' : undefined}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <h1 className="h1">{doc.title}</h1>
        <p className="b2 t3 num legal-date">{legalEffectiveLabel(doc)}</p>
        <div className="legal-body">
          {doc.intro.map((block, index) => (
            <Block key={index} block={block} label={tableLabel(doc.title, doc.intro, block)} />
          ))}
          {doc.articles.map((article) => (
            <section key={article.heading} className="legal-section">
              <h2 className="h3">{article.heading}</h2>
              {article.blocks.map((block, index) => (
                <Block
                  key={index}
                  block={block}
                  label={tableLabel(article.heading, article.blocks, block)}
                />
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}

export default LegalPage
