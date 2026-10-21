import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useSources } from '../../entities/profile'
import { APPLY_CANCEL, APPLY_LOCK, APPLY_TITLE, SOURCE_OPTIONAL, SOURCE_ORIGINAL, applyConfirmLabel } from './constants'
import { postingsApply } from '../../shared/api/operations'


const ApplySheet = ({
  postingId,
  onClose,
  onApplied,
}: {
  postingId: string
  onClose: () => void
  onApplied: () => void
}) => {
  const queryClient = useQueryClient()
  const sources = useSources()
  const [picked, setPicked] = useState<string[] | null>(null)
  const selected = picked ?? (sources.data?.[0] ? [sources.data[0].id] : [])
  const apply = useMutation({
    mutationFn: () => postingsApply(postingId, selected),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posting', postingId] })
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
      onApplied()
    },
  })
  const toggle = (id: string) => {
    setPicked(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="지원 서류" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <h2 className="h2">{APPLY_TITLE}</h2>
          <button type="button" className="hbtn" aria-label="닫기" onClick={onClose}>
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <ul className="source-list">
          {(sources.data ?? []).map((source, index) => (
            <li key={source.id}>
              <label className="check">
                <input type="checkbox" checked={selected.includes(source.id)} onChange={() => toggle(source.id)} />
                <span>
                  <span className="b2">{source.fileName}</span>
                  <span className="c1 t3">{index === 0 ? SOURCE_ORIGINAL : SOURCE_OPTIONAL}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="c1 t3">{APPLY_LOCK}</p>
        <div className="apply-row">
          <button type="button" className="btn sec lg" onClick={onClose}>
            {APPLY_CANCEL}
          </button>
          <button type="button" className="btn pri lg" disabled={selected.length === 0 || apply.isPending} onClick={() => apply.mutate()}>
            {applyConfirmLabel(selected.length)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplySheet
