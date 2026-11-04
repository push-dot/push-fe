import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { mockFit } from '../../shared/api/mock'
import { isMock, send } from '../../shared/lib/bridge'
import { FIT_LOCK_PREVIEW, MOCK_FIT_DELAY_MS } from './constants'
import {
  FIT_COMPARING,
  FIT_LOCK,
  FIT_PART_LABELS,
  FIT_SOON,
  firstDocument,
  fitStatus,
  runPostingFit,
  type FitCardModel,
  type FitDocument,
  type FitPayload,
} from './fit-view'

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

const loadDocument = () =>
  isMock()
    ? Promise.resolve({ id: mockFit.document, title: mockFit.document })
    : firstDocument({ listDocuments: () => api.documents.list({ limit: 1 }) })

const loadFit = (postingId: string, doc: FitDocument) =>
  isMock()
    ? loadMockFit()
    : runPostingFit(postingId, doc, {
        startFit: (id, documentId) => api.postings.fit(id, documentId),
        readJob: (id) => api.jobs.get<FitPayload>(id),
      })

const FitRow = ({ label, value, index }: { label: string; value: number | null; index: number }) => (
  <div className="frow">
    <span>{label}</span>
    <span className="bar">
      {value !== null ? (
        <i className={value < 5 ? 'lo' : undefined} style={{ width: `${value * 10}%`, animationDelay: `${0.15 + index * 0.08}s` }} />
      ) : null}
    </span>
    <b className={value !== null ? 'num' : 'num t4'}>{value !== null ? value.toFixed(1) : '–'}</b>
  </div>
)

const FitCard = ({ postingId }: { postingId: string }) => {
  const mock = isMock()
  const documentQuery = useQuery({ queryKey: ['fit-document', mock], queryFn: loadDocument, staleTime: Infinity })
  const doc = documentQuery.data
  const fitQuery = useQuery({
    queryKey: ['fit', postingId, doc?.id, mock],
    queryFn: () => loadFit(postingId, doc!),
    enabled: !!doc,
    staleTime: Infinity,
  })
  const fit = fitQuery.data
  const status = fitStatus({ documentPending: documentQuery.isPending, document: doc, fitPending: fitQuery.isPending, fit })
  const subtitle =
    status === 'comparing'
      ? FIT_COMPARING
      : status === 'soon'
        ? FIT_SOON
        : status === 'ready' && fit?.reachable != null
          ? `조금만 고치면 ${fit.reachable}점대예요`
          : null
  const document = fit?.document ?? doc?.title
  return (
    <button
      type="button"
      className="fit"
      aria-busy={status === 'comparing'}
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
          <span className="ring ring-empty">{status === 'comparing' ? <span className="glyph" /> : null}</span>
        )}
        <span className="fit-title">
          <span className="c1 t3 w7">내 적합도{document ? ` · ${document}` : ''}</span>
          {subtitle ? <span className={status === 'comparing' ? 'h3 shim shim-ac' : status === 'soon' ? 'h3 t3' : 'h3'}>{subtitle}</span> : null}
        </span>
        <svg className="ic fit-chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
        </svg>
      </div>
      {status === 'locked' ? (
        <div className="fit-lock">
          <div className="fit-lock-rows" aria-hidden="true">
            {FIT_PART_LABELS.map((label, i) => (
              <FitRow key={label} label={label} value={FIT_LOCK_PREVIEW[i] ?? null} index={i} />
            ))}
            <span className="c1 t2 weak">
              <span className="bang">!</span>
              <span className="weak-ghost" />
            </span>
          </div>
          <span className="fit-lock-pill">
            <span className="c1 w7">
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10.5V8a5 5 0 0 1 10 0v2.5M5.5 10.5h13v10h-13Z" />
              </svg>
              {FIT_LOCK}
            </span>
          </span>
        </div>
      ) : (
        <>
          {(fit?.parts ?? FIT_PART_LABELS.map((label) => ({ label, value: null }))).map(({ label, value }, i) => (
            <FitRow key={label} label={label} value={value} index={i} />
          ))}
          {fit?.weakness ? (
            <span className="c1 t2 weak">
              <span className="bang">!</span>
              {fit.weakness}
            </span>
          ) : null}
        </>
      )}
    </button>
  )
}

export default FitCard
