import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { mockFit } from '../../shared/api/mock'
import { isMock, send } from '../../shared/lib/bridge'
import { MOCK_FIT_DELAY_MS } from './constants'
import { FIT_COMPARING, FIT_LOCK, FIT_PART_LABELS, FIT_SOON, loadPostingFit, type FitCardModel, type FitPayload } from './fit-view'

const C = 2 * Math.PI * 27

const loadMockFit = async (): Promise<FitCardModel> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_FIT_DELAY_MS))
  return {
    document: mockFit.document,
    score: mockFit.score,
    parts: mockFit.parts,
    weakness: mockFit.weakness,
    locked: false,
    reachable: mockFit.reachable,
  }
}

const loadFit = (postingId: string) =>
  isMock()
    ? loadMockFit()
    : loadPostingFit(postingId, {
        listDocuments: () => api.documents.list({ limit: 1 }),
        startFit: (id, documentId) => api.postings.fit(id, documentId),
        readJob: (id) => api.jobs.get<FitPayload>(id),
      })

const FitCard = ({ postingId }: { postingId: string }) => {
  const mock = isMock()
  const { data: fit, isPending } = useQuery({ queryKey: ['fit', postingId, mock], queryFn: () => loadFit(postingId), staleTime: Infinity })
  const comparing = mock && isPending
  const parts = fit?.parts ?? FIT_PART_LABELS.map((label) => ({ label, value: null as number | null }))
  const subtitle = comparing
    ? FIT_COMPARING
    : fit?.reachable != null
      ? `조금만 고치면 ${fit.reachable}점대예요`
      : fit?.locked
        ? FIT_LOCK
        : fit
          ? null
          : FIT_SOON
  return (
    <button
      type="button"
      className="fit"
      aria-busy={comparing}
      onClick={() => send({ type: 'open', path: `/chat?postingId=${encodeURIComponent(postingId)}` })}
    >
      <div className="fit-head">
        {fit ? (
          <div className="ring">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="27" className="track" />
              <circle cx="32" cy="32" r="27" className="value" strokeDasharray={`${(fit.score / 10) * C} ${C}`} />
            </svg>
            <span className="num">{fit.score.toFixed(1)}</span>
          </div>
        ) : (
          <span className="ring ring-empty">{comparing ? <span className="glyph" /> : null}</span>
        )}
        <span className="fit-title">
          <span className="c1 t3 w7">내 적합도{fit ? ` · ${fit.document}` : ''}</span>
          {subtitle ? <span className={comparing ? 'h3 shim shim-ac' : fit?.reachable != null || fit?.locked ? 'h3' : 'h3 t3'}>{subtitle}</span> : null}
        </span>
      </div>
      {parts.map(({ label, value }, i) => {
        return (
          <div className="frow" key={label}>
            <span>{label}</span>
            <span className="bar">
              {value !== null ? (
                <i className={value < 5 ? 'lo' : undefined} style={{ width: `${value * 10}%`, animationDelay: `${0.15 + i * 0.08}s` }} />
              ) : null}
            </span>
            <b className={value !== null ? 'num' : 'num t4'}>{value !== null ? value.toFixed(1) : '–'}</b>
          </div>
        )
      })}
      {fit?.weakness ? (
        <span className="c1 t2 weak">
          <span className="bang">!</span>
          {fit.weakness}
        </span>
      ) : null}
    </button>
  )
}

export default FitCard
