<p align="center">
  <img src="app-icon.png" width="96" alt="Push icon" />
</p>

<h1 align="center">Push FE</h1>

<p align="center">
  <strong>근거 기반 커리어 작업공간 Push의 프런트엔드 — Tauri 데스크톱 앱 + 웹</strong>
</p>

<p align="center">
  React 19 · Tauri v2 · Vite · ky · TanStack Query · Zustand · vanilla-extract · TipTap
</p>

---

**push-fe**는 Push의 클라이언트다. Tauri v2 셸로 macOS 데스크톱 앱으로 실행되고, 같은 코드가 Vite로 일반 웹앱으로도 뜬다. 채팅 기반 AI 워크플로 UI, 문서 편집기, 커리어 볼트, 지원 관리, 면접 준비를 포함한다.

## 주요 기능

- **채팅 워크플로** — 공고 URL·이력서 첨부 → SSE 토큰 스트리밍 → Phase 게이트에 번호/자유 입력으로 응답
- **스트림 자동 재연결** — 다른 화면을 갔다 와도 진행 중 응답을 서버에서 다시 붙여 이어서 렌더링
- **관측성** — Sentry ErrorBoundary가 앱 루트를 감싸고 모든 API 요청에 `X-Request-Id`를 붙여 백엔드 `http_request` 로그와 같은 키로 조인
- **A/B 실험 연동** — 배정(`useExperiment`/`useVariant`)과 렌더링을 분리해 스트림 표시 방식·승인 UI를 variant로 분기하고 노출/전환/중단/거절 이벤트를 기록
- **멀티라인 컴포저** — textarea 자동 확장, Shift+Enter 줄바꿈, IME 조합 중 전송 방지, 파일 드래그·붙여넣기
- **문서 에디터** — TipTap 기반, 버전 관리, PDF/DOCX 다운로드
- **추론 설정** — 접근 모드(관리형/BYOK), 역할별(generate/research) 모델 선택, effort 조정
- **지원 관리·커리어 볼트·면접 준비** — 이력서 외 커리어 라이프사이클 전체

## 스택

- **Tauri v2** — 네이티브 데스크톱 셸 (`src-tauri`, Rust)
- **React 19 + Vite** — UI
- **ky** — API 클라이언트 (`src/shared/api`)
- **TanStack Query** — 서버 상태 (`features/*/api/hooks.ts`)
- **Zustand** — 로컬 UI 상태 (`features/*/stores.ts`)
- **vanilla-extract** — 디자인 시스템은 `@push/design-system` 인레포 패키지 (`packages/design-system`, 토큰 contract + 라이트/다크 테마, `recipe` variants, `sprinkles`, `createVar`/`assignInlineVars`, Storybook)
- **TipTap** — 문서 에디터
- **Feature-based** — `app` / `pages` / `features` / `shared` 구조
- **Vitest + Testing Library** — 테스트
- **ESLint + Prettier** — 린트/포맷

## 구조

```
src/
  app/            앱 셸 — main.tsx 진입점, routes, lazy-pages, ui(사이드바 등)
  pages/          라우트 페이지 (lazy-pages.ts로 지연 로드)
  features/<name>/  도메인 피처 — api(fetchers/hooks/schemas), components, stores, types
  shared/         api 클라이언트, components, lib, constants, i18n
  theme/          컴포넌트 스타일
packages/
  design-system/  @push/design-system — vanilla-extract 토큰/컴포넌트/Storybook
src-tauri/        Tauri v2 셸 (Rust)
e2e/              Playwright e2e (웹)
e2e-tauri/        WebdriverIO tauri e2e
```

엔트리 경계(`app/`, `main.tsx`)는 피처/페이지 배럴(`index.ts`) 대신 모듈을 직접 import한다. 배럴을 경유하면 lazy 페이지 의존성이 엔트리 청크로 올라간다 — `docs/bundle-optimization.md` 참조.

## 실행

```bash
npm ci             # 의존성 설치
npm run dev        # Vite dev 서버 (웹)
npm run build      # tsc -b && vite build → dist/
npm run preview    # 빌드 결과 프리뷰
npx tauri dev      # Tauri 데스크톱 앱 dev
npx tauri build    # 데스크톱 번들 (release.yml에서 dmg/nsis)
```

## 테스트·검증

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest run (유닛·컴포넌트)
npm run test:e2e        # Playwright (dev 서버 자동 기동)
npm run test:e2e:tauri  # WebdriverIO tauri-driver e2e
```

CI(`.github/workflows/ci.yml`): PR→develop에서 `npm ci` → typecheck → lint → vitest. Playwright e2e job은 `continue-on-error`로 실패 허용.


