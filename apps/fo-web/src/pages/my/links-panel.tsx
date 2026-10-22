import type { LinkKind } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { LINK_ADD_FAILED, LINK_EMPTY, LINK_FAILED, LINK_KINDS, LINK_NOTE } from './constants'
import { useLinks } from '../../entities/profile'
import { meAddLink } from '../../features/add-link'


const LinksPanel = () => {
  const queryClient = useQueryClient()
  const [kind, setKind] = useState<(typeof LINK_KINDS)[number]['key']>('all')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const query = useLinks(kind)
  const add = useMutation({
    mutationFn: () => meAddLink({ url: url.trim(), title: title.trim() || undefined, kind: kind === 'all' ? undefined : (kind as LinkKind) }),
    onSuccess: async () => {
      setUrl('')
      setTitle('')
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['links'] })
    },
    onError: () => setError(LINK_ADD_FAILED),
  })
  const items = query.data?.data ?? []
  return (
    <section className="stack">
      <div className="kind-row">
        {LINK_KINDS.map((item) => (
          <button key={item.key} type="button" className="chip" aria-pressed={kind === item.key} onClick={() => setKind(item.key)}>
            {item.key === 'all' && query.data ? `${item.label} ${query.data.data.length}` : item.label}
          </button>
        ))}
      </div>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          if (!url.trim()) return
          add.mutate()
        }}
      >
        <label className="field">
          주소
          <input value={url} placeholder="https://" onChange={(event) => setUrl(event.target.value)} />
        </label>
        <label className="field">
          제목
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <button type="submit" className="btn pri sm" disabled={url.trim().length === 0 || add.isPending}>
          링크 추가
        </button>
      </form>
      {query.isError ? <p className="b2 t3">{LINK_FAILED}</p> : null}
      {!query.isLoading && !query.isError && items.length === 0 ? <p className="b2 t3">{LINK_EMPTY}</p> : null}
      {items.length ? (
        <div className="box">
          {items.map((item) => (
            <div key={item.id} className="link-file">
              <span className="link-copy">
                <span className="b1 w7 cap">{item.title || item.url}</span>
                <span className="c1 t3 cap">{item.url}</span>
              </span>
              <span className="badge grey">{LINK_KINDS.find((entry) => entry.key === item.kind)?.label ?? item.kind}</span>
            </div>
          ))}
        </div>
      ) : null}
      <p className="c1 t3">{LINK_NOTE}</p>
      {error ? <p className="auth-error">{error}</p> : null}
    </section>
  )
}

export default LinksPanel
