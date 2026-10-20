import { useQuery } from '@tanstack/react-query'
import { isMock, send } from '../bridge'
import { mockFit, type Fit } from '../mock'

const C = 2 * Math.PI * 27

// shortcut: push-be has no fit-score API; mock mode shows the board values after a fake load, real mode the placeholder.
const loadFit = async (): Promise<Fit | null> => {
  if (!isMock()) return null
  await new Promise((r) => setTimeout(r, 1200))
  return mockFit
}

/** "내 적합도" card. Tapping asks the app to open AI 채팅 with this posting attached (feature-spec 14). */
export function FitCard({ postingId }: { postingId: string }) {
  const { data: fit, isPending } = useQuery({ queryKey: ['fit', postingId], queryFn: loadFit, staleTime: Infinity })
  const parts: { label: string; value: number | null }[] =
    fit?.parts ?? ['기술 스택', '경험 연관성', '키워드'].map((label) => ({ label, value: null }))
  return (
    <button
      type="button"
      className="fit"
      aria-busy={isPending}
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
          <span className="ring ring-empty">{isPending ? <span className="glyph" /> : null}</span>
        )}
        <span className="fit-title">
          <span className="c1 t3 w7">내 적합도{fit ? ` · ${fit.document}` : ''}</span>
          {isPending ? (
            <span className="h3 shim shim-ac">공고와 서류를 비교하는 중…</span>
          ) : fit ? (
            <span className="h3">조금만 고치면 {fit.reachable}점대예요</span>
          ) : (
            <span className="h3 t3">적합도는 곧 볼 수 있어요</span>
          )}
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
      {fit ? (
        <span className="c1 t2 weak">
          <span className="bang">!</span>
          {fit.weakness}
        </span>
      ) : null}
    </button>
  )
}
