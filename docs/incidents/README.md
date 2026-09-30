# 인시던트 대응 프로세스

push-fe 운영 중 발생하는 장애의 대응 절차. 디버깅 실전 순서는 `docs/runbook.md`, 기록 양식은 `POSTMORTEM_TEMPLATE.md`를 사용한다.

원칙: 복구가 원인 분석보다 먼저다. 원인을 모르더라도 완화 수단(실험 variant 롤백, revert)이 있으면 먼저 적용하고, 근본 원인은 포스트모템에서 정리한다.

## 단계

### 1. 탐지 (Detection)

- **Sentry 이슈/알림** — `Sentry.ErrorBoundary`가 앱 루트를 감싸므로(`src/app/main.tsx`) 렌더 크래시는 자동 수집된다. 신규 이슈 급증·release별 regression은 Sentry 대시보드에서 확인. `environment`는 `import.meta.env.MODE`로 태깅된다(`src/shared/lib/observability.ts`).
- **사용자/팀 내부 제보** — 재현 경로와 대략의 시각을 반드시 확보한다.
- **백엔드 `http_request` 로그 이상** — 5xx 비율 증가 등으로 프런트 문제가 먼저 보이는 경우도 있다. `X-Request-Id`로 프런트 요청과 조인해 어느 측 문제인지 가른다.

### 2. 분류 (Triage)

- **심각도**: 앱 전체 크래시/핵심 플로우(채팅 전송·승인·문서 저장) 불가 = P1, 특정 기능 저하·우회 가능 = P2, 외관/사소한 오류 = P3.
- **범위 파악**: Sentry 이슈의 affected users, 첫 발생 release/환경. 최근 머지된 PR과 시간적으로 대응되는지 확인.
- **담당자 지정**: P1/P2는 대응 오너 1명을 정하고, 타임라인 기록을 시작한다(포스트모템 재료).

### 3. 완화 (Mitigation)

복구 수단을 빠른 순으로 적용한다.

1. **실험/variant 킬스위치** — 장애 코드 경로가 실험(`EXPERIMENT_KEYS`) 뒤에 있다면 배포 없이 서버 측 배정을 바꿔 끈다. `GET /experiments/{key}/assignment`의 배정을 control(`'A'`)로 되돌리거나 `enrolled: false`로 내리면 클라이언트는 다음 assignment 조회부터 fallback으로 복귀한다. 모든 variant 소비자는 미조회/실패 시 `'A'`로 fallback하므로(`src/shared/lib/experiment.ts`) 안전하다. **신규 위험 기능은 실험 뒤에 두는 것이 권장 패턴** — 이 수단을 쓸 수 있게 된다.
2. **Revert** — 원인 커밋이 명확하면 revert PR을 `hotfix/*` 브랜치로 `main`에 넣는다(절차는 runbook).
3. **핫픽스** — 최소 수정만 포함한 `hotfix/*` → `main` 머지 후 릴리스, 완료되면 `develop`으로 백머지.

### 4. 포스트모템 (Postmortem)

- P1/P2는 완화 후 **48시간 이내**에 `POSTMORTEM_TEMPLATE.md`를 복사해 `docs/incidents/YYYY-MM-DD-<slug>.md`로 작성한다.
- 비난 없이(blameless) 타임라인·근본 원인·개선 항목에 집중한다.
- P3는 템플릿 전체 대신 해당 PR 설명에 근본 원인 + 회귀 테스트 링크만 남겨도 된다.

### 5. 액션 아이템

- 각 항목에 **오너와 기한**을 붙인다. 오너 없는 항목은 실행되지 않는다.
- 추적은 GitHub 이슈/후속 PR로 연결한다.

### 6. 회귀 테스트 요구사항

- **모든 인시던트 수정에는 실패하던 시나리오를 재현하는 테스트가 동반돼야 한다.** vitest(유닛/컴포넌트)가 기본이고, 사용자 플로우 단위 장애는 Playwright(`e2e/`)로 작성한다.
- 수정 PR에는 "회귀 테스트" 항목(PR 템플릿)을 채운다. 테스트가 사건 전 코드에서 실패하고 수정 후 통과함을 확인하는 것이 이상적이다.
- 테스트 추가가 불가능한 경우(인프라/환경 이슈 등) 사유와 대체 검증 수단을 포스트모템 액션 아이템에 남긴다.
