export function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <section className="section">
      <h2 className="h3">{title}</h2>
      <ul className="b2 t2">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

/** Loading / error placeholder. The native shell also gets `{type:'error'}` and may show its own retry. */
export function Status({ error, what }: { error: boolean; what: string }) {
  return (
    <main className="status b2 t3" aria-busy={!error}>
      {error ? `${what}를 불러오지 못했어요` : null}
    </main>
  )
}
