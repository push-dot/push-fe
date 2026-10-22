const Status = ({ error, what }: { error: boolean; what: string }) => {
  return (
    <main className="status b2 t3" aria-busy={!error}>
      {error ? `${what}를 불러오지 못했어요` : null}
    </main>
  )
}

export default Status
