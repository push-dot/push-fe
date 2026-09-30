# 실험 카드: 스트리밍 렌더링 + 승인 UI

실험 인프라는 `src/shared/lib/experiment.ts` + `src/shared/api/experiments.ts`에 있다. 배정(assignment)과 exclusion은 서버가 `GET /experiments/{key}/assignment`로 내려주고(`enrolled`, `variant`), 클라이언트는 variant를 소비하고 이벤트만 `POST /experiments/{key}/events`로 보낸다. 이벤트 종류는 `EXPERIMENT_EVENTS`(`exposure`, `conversion`, `aborted`, `reject`), 키는 `EXPERIMENT_KEYS`(`stream-render`, `approval-surface`) — `src/shared/constants.ts`.

공통 규칙:

- variant 미조회/실패 시 fallback `'A'`(control). 실험 꺼져도 기본 UX 유지.
- `trackExperiment`는 `key:scope:event`로 dedupe — exposure 중복 전송 방지.
- `useExperiment`는 `enrolled`일 때만 exposure를 쏜다. `useExperimentVariant`/`experimentVariant`는 exposure 없이 variant만 반환(비노출 경로의 오염 방지).

---

## 1. `stream-render` — 토큰 스트리밍 표시 방식

**코드**: `src/features/chat/stores.ts` (`streamVariant`, `flushStream`, `send`, `abort`, `commitDone`)

**목표**: 토큰 단위 점진 렌더링이 후속 대화를 유도하는지, 아니면 완성본 일괄 표시가 충분한지 검증.

**변형**

| variant | 동작 |
|---|---|
| A (control) | `STREAM_FLUSH_MS`(16ms) 배치로 `streamText`에 토큰을 누적 렌더링. 커서 블링크 표시 |
| B | `streamText`를 항상 `''`로 유지. 상태줄(`streamStatus`)만 표시하고 `done`에서 완성 메시지 한 번에 커밋 |

variant는 `send()`/`attachStream()` 진입 시 `deps.streamRenderVariant()`로 조회 — 전송 단위로 배정이 적용된다.

**지표**

| 이벤트 | 코드상 의미 |
|---|---|
| `exposure` | 첫 flush(`buf.text` 있을 때) 또는 `commitDone` — 실제로 스트림 결과를 "본" 전송 |
| `conversion` | 이전 `done`(`lastDoneAt`) 이후 `STREAM_FOLLOW_UP_MS`(30s) 안에 후속 메시지 전송 — **후속 메시지 전환** |
| `aborted` | `sendStatus`가 `sending`/`streaming`인 동안 사용자가 중단 — **가드레일: 중단** |

이탈은 별도 이벤트 없음 — `aborted` 비율과 conversion 간 전송 간격(서버 타임스탬프)으로 대체 관찰.

**판단 로직**: B의 conversion이 A보다 낮지 않고 `aborted`가 증가하지 않으면 B 채택(렌더 비용 절감). conversion이 좋아져도 `aborted`가 나빠지면 도입하지 않는다.

---

## 2. `approval-surface` — 승인 요청 노출 방식

**코드**: `src/features/chat/components/approval-surface.tsx`, `approval-card.tsx`

**목표**: 승인 요청을 인라인 카드로만 보여줄 때 vs 모달로 띄울 때 승인 처리율/속도 차이 측정.

**변형**

| variant | 동작 |
|---|---|
| A (control) | 타임라인에 `ApprovalCard` 인라인만 |
| B | 인라인 카드 + `Dialog` 모달로 동일 카드 표시. 모달 dismiss(`dismissedId`)해도 인라인 카드는 유지 — 결정 자체는 두 표면 어디서든 가능 |

**지표**

| 이벤트 | 코드상 의미 |
|---|---|
| `exposure` | approval이 `PENDING`인 동안 surface가 렌더됨(scope = approvalId로 dedupe) |
| `conversion` | `useDecideApproval` 성공 — 승인이든 거부든 **결정 완료** |
| `reject` | 결정이 `DENIED` — **가드레일: 거절** |

**승인까지 걸린 시간**: 별도 이벤트 없음. 서버 측에서 `exposure` → `conversion` 이벤트 타임스탬프 차이로 산출한다(클라이언트는 이벤트만 기록).

모달 dismiss는 이벤트로 기록되지 않는다 — 이탈 가드레일로 쓰려면 dismiss 추적을 추가해야 한다(현재는 `dismissedId` 로컬 상태만).

**판단 로직**: B의 conversion(결정 완료율)과 exposure→conversion 시간이 개선돼도 `reject`(거절 비율)가 유의미하게 오르면 도입하지 않는다 — 모달 압박으로 사용자가 거절을 더 고르는 경우를 가드레일로 간주.
