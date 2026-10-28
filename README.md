<p align="center">
  <img src="apps/fo-mobile/assets/icon.png" width="96" alt="Push icon" />
</p>

<h1 align="center">Push FE</h1>

<p align="center">
  <strong>근거 기반 커리어 작업공간 Push의 프론트엔드 — 모바일 앱, 웹, 데스크톱</strong>
</p>

<p align="center">
  pnpm workspaces · Turborepo · React 19 · Expo · Vite · TanStack Query
</p>

---

**push-fe**는 Push 클라이언트를 모아 둔 모노레포예요. 앱 3개와 공통 패키지 2개가 있어요. 화면 디자인 기준은 Claude Design이고, 시안은 `docs/design/`에 있어요.

| 앱 | 대상 | 스택 |
|---|---|---|
| `apps/fo-mobile` | 개인 사용자 iOS·Android 앱. AI 채팅이 있는 메인 앱이에요. | Expo SDK 58, React Native 0.88, Expo Router, Zustand |
| `apps/fo-web` | 개인용 웹(채용공고·허브·소셜)과 기업용 웹(공고·지원자·기업 AI). 모바일 앱 안의 WebView로도 열려요. | Vite, React 19, React Router 7, es-hangul |
| `apps/fo-desktop` | Tauri 데스크톱 앱. 지금은 개발을 멈춘 상태예요. | Tauri v2, Mantine, TipTap, vanilla-extract |

| 패키지 | 내용 |
|---|---|
| `packages/api-client` | `@push/api-client`. fo-web과 fo-mobile이 함께 쓰는 push-be API 클라이언트예요. ky 기반이고, 타입(`types.ts`), 엔드포인트(`endpoints.ts`), SSE 스트림(`sse.ts`), 작업 폴링(`jobs.ts`)이 들어 있어요. |
| `packages/design-system` | `@push/design-system`. 구버전 디자인 시스템(vanilla-extract, Storybook)이에요. fo-desktop만 써요. fo-web과 fo-mobile은 Claude Design 기준으로 각자 UI 컴포넌트를 만들어 써요. |

## AI

AI는 Push가 제공하는 관리형 모델만 써요. 사용자 API 키(BYOK)는 받지 않아요. 요금제(Free·Pro·Ultra)에 따라 쓸 수 있는 모델과 크레딧이 정해져요. 채팅은 SSE로 응답을 받고, 다른 화면에 갔다 와도 진행 중인 응답에 다시 이어 붙어요.

## 실행

패키지 매니저는 **pnpm**이에요. 버전은 `package.json`의 `packageManager`에 고정돼 있어요. 다른 패키지 매니저(npm, yarn, bun)로 설치하지 마세요. `package.json`이나 lock 파일이 바뀌어요.

```bash
pnpm install
```

### fo-mobile

```bash
pnpm --filter @push/fo-mobile start     # Expo 개발 서버
pnpm --filter @push/fo-mobile ios       # iOS 빌드 후 실행
pnpm --filter @push/fo-mobile android   # Android 빌드 후 실행
```

Expo 패키지를 추가할 때는 `npx expo install <package>`를 쓰세요. SDK에 맞는 버전을 골라 줘요. 자세한 규칙은 `apps/fo-mobile/AGENTS.md`에 있어요.

### fo-web

```bash
pnpm --filter @push/fo-web dev          # http://localhost:5174
pnpm --filter @push/fo-web build        # tsc -b && vite build
```

### fo-desktop

루트 `pnpm dev`와 `pnpm build`는 fo-desktop을 대상으로 해요.

```bash
pnpm dev                                # Vite 개발 서버
pnpm --filter @push/fo-desktop tauri dev
```

## 환경 변수

| 변수 | 앱 | 기본값 | 용도 |
|---|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | fo-mobile | `https://push-be.youngjoon568.workers.dev/api/v1` | push-be API 주소 |
| `EXPO_PUBLIC_WEB_BASE_URL` | fo-mobile | `http://localhost:5174` | WebView로 여는 fo-web 주소 |
| `EXPO_PUBLIC_API_MOCK` | fo-mobile | 꺼짐 | `1`이면 목업 데이터로 동작해요. |
| `EXPO_PUBLIC_DEV_AUTH_TOKEN` | fo-mobile | 없음 | 개발용 인증 토큰 |
| `VITE_API_BASE_URL` | fo-web, fo-desktop | `https://push-be.youngjoon568.workers.dev/api/v1` | push-be API 주소 |
| `VITE_SENTRY_DSN` | fo-desktop | 없음 | Sentry 오류 수집 |
| `VITE_LOCIZE_PROJECT_ID`, `VITE_LOCIZE_API_KEY` | fo-desktop | 없음 | Locize 번역 |

fo-web은 주소에 `?mock`을 붙이면 목업 데이터로 동작해요. 모바일 앱 WebView 안에서는 앱이 `window.__PUSH__`로 토큰, API 주소, 목업 여부를 넘겨줘요.

## 테스트·검증

```bash
pnpm typecheck       # turbo run typecheck — 모든 앱·패키지
pnpm lint            # turbo run lint
pnpm test            # turbo run test (Vitest)
pnpm check           # typecheck, lint, test, build 한 번에
pnpm test:e2e        # fo-desktop Playwright e2e
```

CI(`.github/workflows/ci.yml`)는 모든 PR과 develop·main push에서 돌아요. `pnpm install --frozen-lockfile` → `turbo run typecheck lint test` → `pnpm run build` 순서예요. fo-desktop Playwright e2e는 별도 job이에요.

## 구조

```
apps/
  fo-mobile/   Expo 앱 — src/app(Expo Router 경로), screens, features, shared, theme, mock
  fo-web/      Vite 웹 — Feature-Sliced Design(app, pages, features, entities, shared)
  fo-desktop/  Tauri 앱 — src(app, pages, features, shared, theme), src-tauri(Rust)
packages/
  api-client/     @push/api-client
  design-system/  @push/design-system (구버전, fo-desktop 전용)
docs/
  design/      Claude Design 시안 (HTML·PNG)
  plans/       구현 계획
```

## 기여

- 브랜치는 `develop`에서 만들고, PR은 `develop`으로 올려요. `main`에는 릴리스 PR로만 반영해요.
- 커밋과 PR 제목은 Conventional Commits 형식을 따라요. 예: `fix(fo-web): …`
- PR 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`)의 체크리스트를 채워 주세요.
