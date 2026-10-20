import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api'
import { APPLY_CONFIRM, SOURCE_OPTIONAL, SOURCE_ORIGINAL } from './constants'
import { listSources } from '../../shared/api/sources'

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
  const sources = useQuery({ queryKey: ['sources'], queryFn: listSources })
  const [picked, setPicked] = useState<string[] | null>(null)
  const selected = picked ?? (sources.data?.[0] ? [sources.data[0].id] : [])
  const apply = useMutation({
    mutationFn: () => api.postings.apply(postingId, selected),
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
          <h2 className="h3">지원 서류</h2>
          <button type="button" className="text-link" onClick={onClose}>
            닫기
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
        <button type="button" className="primary" disabled={selected.length === 0 || apply.isPending} onClick={() => apply.mutate()}>
          {APPLY_CONFIRM}
        </button>
      </div>
    </div>
  )
}

export default ApplySheet
