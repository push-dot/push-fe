# 런북: 프런트엔드 장애 디버깅

실전 순서는 Sentry 이슈 → request-id → 백엔드 로그 → 재현 → 핫픽스 → 검증. 프로세스 전반은 `docs/incidents/README.md` 참조.

## 1. Sentry 이슈에서 시작

- `Sentry.ErrorBoundary`가 앱 루트(`src/app/main.tsx`)를 감싸고 있어 렌더 크래시는 스택과 함께 자동 수집된다. 초기화는 `src/shared/lib/observability.ts` — `environment`는 `import.meta.env.MODE`(development/production), `tracesSampleRate: 0.2`.
- 이슈에서 확인할 것:
  - **environment / release** — 어느 배포부터인지. 첫 이벤트 시각과 최근 머지 커밋을 대조한다.
  - **스택의 feature 경로** — `features/chat`인지 `pages`인지로 담당 영역을 좁힌다.
  - **breadcrumbs** — 직전 API 요청/네비게이션. 실패한 요청이 보이면 2단계로.

주의: DSN(`VITE_SENTRY_DSN`)이 없는 빌드는 `Sentry.init` 자체가 스킵된다 — 로컬/테스트 빌드에서 이벤트가 안 오는 게 정상이다.

## 2. X-Request-Id로 백엔드 로그 조인

- 모든 API 요청은 ky `beforeRequest` 훅에서 `X-Request-Id: crypto.randomUUID()`를 붙인다(`src/shared/api/client.ts`). 이 값이 백엔드 `http_request` 로그의 조인 키다.
- Sentry breadcrumb/네트워크 탭/재현 중 DevTools에서 실패 요청의 `X-Request-Id` 값을 복사 → 백엔드 로그에서 같은 키로 검색하면 서버 측 스택·상태코드·쿼리를 볼 수 있다.
- 프런트가 멀쩡한데 5xx만 쏟아지는 패턴이면 백엔드 인시던트로 핸드오프 — request-id 목록을 같이 넘긴다.
- 참고: `retry`는 GET + 408/502/503/504에만 1회(`client.ts`). 재시도로 request-id가 새로 발급되는지(훅이 매 요청 실행되므로 새 UUID) 염두에 두고 로그를 본다.

## 3. 재현

- `npm run dev`로 해당 플로우 재현. Sentry 스택의 경로·breadcrumb 순서를 따라간다.
- 실험 관련이면 variant 확인: `GET /experiments/{key}/assignment` 응답(`enrolled`, `variant`)을 보고 A/B 어느 경로인지 특정. 로컬에서 서버 배정을 바꿔 두 variant 모두 재현해 본다.
- 데스크톱 전용 문제면 `npx tauri dev` — 웹뷰와 Tauri 셸 차이(deep link, 파일 접근)에서만 생기는 버그가 있다.

## 4. 완화 우선 — 핫픽스 브랜치 규칙

원인을 몰라도 완화가 가능하면 먼저 한다.

- **실험 킬스위치(무배포)**: 위험 경로가 `EXPERIMENT_KEYS` 뒤에 있으면 서버에서 배정을 `'A'`(control) 또는 `enrolled: false`로 변경. 클라이언트는 assignment 조회 실패/미조회 시 `'A'`로 fallback하므로(`experiment.ts`) 배포 없이 복귀한다.
- **코드 수정이 필요하면**:
  1. `main`에서 `hotfix/<slug>` 브랜치 생성 — `git checkout -b hotfix/<slug> origin/main`
  2. 최소 수정 + 회귀 테스트(아래 5)를 커밋. Conventional commits(`fix(scope): ...`).
  3. PR은 `main`으로. CI(`ci.yml`: typecheck → lint → vitest) 통과 후 머지.
  4. 데스크톱 배포가 필요하면 `v*` 태그로 릴리스(`release.yml`이 dmg/nsis 빌드·업로드). 웹만이면 웹 배포 절차를 따른다.
  5. **백머지**: `main` → `develop` 머지(또는 `develop`에서 `git merge origin/main`)로 핫픽스가 develop에도 들어가게 한다. 이걸 빼면 다음 릴리스에서 재발한다.

## 5. 회귀 테스트

- 실패하던 경로를 재현하는 테스트를 수정에 포함한다. 유닛/컴포넌트는 vitest(`npm test`), 사용자 플로우는 Playwright(`e2e/`, `npm run test:e2e`).
- 확인법: 수정 없이 테스트만 먼저 커밋해 실패하는지 보거나, 로컬에서 fix를 stash하고 테스트를 돌려본다.

## 6. 검증 체크리스트

머지 전:

- [ ] `npm run typecheck` 통과
- [ ] `npm run lint` 통과
- [ ] `npm test` 통과 + 신규 회귀 테스트 포함
- [ ] 관련 e2e가 있으면 로컬 `npm run test:e2e`로 해당 spec 확인(CI의 e2e job은 `continue-on-error`라 green이 아닐 수 있다)

배포 후:

- [ ] Sentry에서 동일 이슈의 신규 이벤트가 멈췄는지 확인(해당 release 기준)
- [ ] 킬스위치를 썼다면 배정 변경 후 실제 클라이언트가 control로 돌아왔는지 확인(`GET /experiments/{key}/assignment` 응답 + 동작 눈검증)
- [ ] `main` → `develop` 백머지 완료
- [ ] 포스트모템 작성 시작(P1/P2: 48시간 이내, `docs/incidents/POSTMORTEM_TEMPLATE.md`)
