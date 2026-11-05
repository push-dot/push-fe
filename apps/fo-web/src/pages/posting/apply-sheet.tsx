import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useSources } from '../../entities/profile'
import { applySourceIds, postingsApply } from '../../features/apply-to-posting'
import { APPLY_FAILURE, APPLY_GUIDANCE, APPLY_PENDING, applyPair, keepRadio, kindLine, sourceSub } from './apply-copy'
import { APPLY_CONFIRM, APPLY_TITLE } from './constants'

const ApplySheet = ({
  postingId,
  company,
  title,
  onClose,
  onApplied,
}: {
  postingId: string
  company?: string | null
  title?: string | null
  onClose: () => void
  onApplied: () => void
}) => {
  const queryClient = useQueryClient()
  const sources = useSources()
  const [picked, setPicked] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const selected = picked ?? sources.data?.[0]?.id ?? null
  const chosen = (sources.data ?? []).find((source) => source.id === selected)
  const apply = useMutation({
    mutationFn: () => {
      const { documentIds, sourceIds } = applySourceIds(sources.data ?? [], selected ? [selected] : [])
      return postingsApply(postingId, documentIds, sourceIds)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posting', postingId] })
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
      onApplied()
    },
    onError: () => setFailed(true),
  })
  const choose = (id: string) => {
    setPicked(keepRadio(selected, id))
    setFailed(false)
  }
  const extra = kindLine((chosen as { kind?: string } | undefined)?.kind)
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div className="sheet apply-sheet" role="dialog" aria-modal="true" aria-label="지원 서류" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-grabber" aria-hidden="true" />
        <h2 className="h2">{APPLY_TITLE}</h2>
        {applyPair(company, title) ? <p className="b2 t2">{applyPair(company, title)}</p> : null}
        <ul className="source-list">
          {(sources.data ?? []).map((source) => (
            <li key={source.id}>
              <label className="check apply-radio">
                <input type="radio" name="apply-source" checked={source.id === selected} onChange={() => choose(source.id)} />
                <span>
                  <span className="b2">{source.fileName}</span>
                  <span className="c1 t3">{sourceSub(source.origin, source.createdAt)}</span>
                  {source.id === selected && extra ? <span className="c1 t3">{extra}</span> : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="c1 t3">{APPLY_GUIDANCE}</p>
        {failed ? <p className="c1">{APPLY_FAILURE}</p> : null}
        <button type="button" className="btn pri lg" disabled={selected === null || apply.isPending} onClick={() => apply.mutate()}>
          {apply.isPending ? APPLY_PENDING : APPLY_CONFIRM}
        </button>
      </div>
    </div>
  )
}

export default ApplySheet
