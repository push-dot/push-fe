<p align="center">
  <img src="assets/logo/push-app-icon-dark-tile.png" width="128" alt="Push 마스코트" />
</p>

<h1 align="center">Push FE</h1>

<p align="center">
  <strong>Push의 모바일 앱과 웹. 공고·허브·소셜, 그리고 모바일 AI 채팅</strong>
</p>

<p align="center">
  pnpm 11 · Turborepo · React 19 · Expo SDK 58 · Vite 6 · TanStack Query 5
</p>

---

**push-fe**는 Push의 웹과 모바일 클라이언트를 모아 둔 pnpm 워크스페이스예요. 앱은 `apps/fo-web`, `apps/fo-mobile`이고, 둘이 같이 쓰는 패키지는 `packages/api-client`, `packages/shared`예요.

화면 문구는 한국어이고, 시안 HTML은 `docs/design/`에 있어요. `docs/plans/`는 구현 계획이에요.

| 패키지 | 하는 일 |
| --- | --- |
| `apps/fo-mobile` (`@push/fo-mobile`) | 개인용 iOS·Android 앱. 탭은 홈, 허브, 소셜, AI 채팅, 마이예요. |
| `apps/fo-web` (`@push/fo-web`) | 개인 웹과 기업 웹. 개발 서버는 5174예요. 모바일 WebView도 이 앱의 공고·프로필 상세를 열어요. |
| `packages/api-client` (`@push/api-client`) | push-be `/api/v1` 클라이언트. ky, 타입, SSE 파서, 작업 폴링. |
| `packages/shared` (`@push/shared`) | 한글 검색(`es-hangul`), 경력 라벨, 날짜, 파일 크기. 웹과 모바일이 같이 써요. |

## 개요

개인 웹과 모바일은 공고를 보고, 검색하고, 허브 프로필과 소셜, 제안, 알림, 내 정보를 다뤄요. 웹에서 로그인 없이 열리는 경로는 `/`, `/jobs`, `/search`, `/postings/:id`예요.

AI 채팅 화면은 모바일에 있어요. 메시지는 SSE로 받고, 진행 중인 응답은 다시 이어 받아요. 웹의 AI 채팅은 기업 화면(`/employer/chat`)에 있어요.

기업 웹은 사업자 확인, 공고 작성, 지원자, 담당자 초대, 요금제 화면을 가져요. 계정 종류는 `PERSONAL`과 `EMPLOYER`이고, 로그인 화면에서 고른 뒤 바뀌지 않아요.

모바일 로그인은 Google과 GitHub OAuth(PKCE, 콜백 `push://auth/callback`)예요. 개발 빌드에서만 `EXPO_PUBLIC_DEV_AUTH_TOKEN`으로 들어갈 수 있어요. 웹 개인 로그인은 Google, GitHub, 이메일이에요. 기업 로그인은 Google과 이메일이에요. 이메일 가입·인증·비밀번호 재설정 경로는 `/signup`, `/auth/verify`, `/auth/reset`이에요.

## 아키텍처

```
fo-mobile                         fo-web
Expo Router + Zustand             React Router + TanStack Query
expo-secure-store                 브라우저 세션 (push-web-session)
        │                                │
        │  WebView: /postings/:id        │
        │           /profiles/:id        │
        └──────── @push/api-client ──────┘
                         │  ky, Bearer, 401이면 refresh 한 번
                         ▼
                    push-be /api/v1
```

웹이 `window.ReactNativeWebView` 안에 있으면 라우터는 공고 상세와 프로필 상세만 남겨요. 앱이 `window.__PUSH__`로 토큰, API 주소, 목업 여부를 넘겨요. WebView 안에서는 웹이 refresh를 시도하지 않아요.

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| 워크스페이스 | pnpm 11.0.4 (`packageManager`), Turborepo 2.11, TypeScript 5.8 (모바일만 6.0) |
| Node | CI는 Node 22 |
| 모바일 | Expo SDK 58.0, React Native 0.88, React 19.3, Expo Router 58, Native Tabs, Zustand 5, React Native WebView 14, `@expo/ui` |
| 웹 | Vite 6, React 19.1, React Router 7, TanStack Query 5, Pretendard |
| HTTP | `@push/api-client` (ky 1) |
| 한글 검색 | `@push/shared`가 `es-hangul` 2.4를 감싸요 |
| 테스트 | Vitest. 모바일 린트는 `expo lint` |
| 번들 ID | iOS·Android 모두 `app.push.mobile`. URL 스킴은 `push` |

웹에는 i18n 라이브러리가 없고, 문구는 페이지의 한국어 상수예요. 모바일 상태 저장은 Zustand, 서버 상태는 TanStack Query예요. 웹의 서버 상태도 TanStack Query이고, Zustand는 쓰지 않아요.

## 실행

패키지 매니저는 **pnpm**이에요. `package.json`의 `packageManager`에 고정돼 있어요.

```bash
pnpm install
```

### fo-web

```bash
pnpm --filter @push/fo-web dev       # http://localhost:5174, host 공개
pnpm --filter @push/fo-web build     # tsc -b && vite build
pnpm --filter @push/fo-web preview   # 포트 5174
pnpm --filter @push/fo-web test
pnpm --filter @push/fo-web typecheck
```

`@push/fo-web`에는 `lint` 스크립트가 없어요.

목업은 주소에 `mock` 쿼리를 붙여요. `as`는 `personal`, `employer`, `employer-pro`, `employer-ultra`, `employer-new` 중 하나예요. 목업이면 `shared/api/mock.ts`가 fetch를 대체해요.

### fo-mobile

```bash
pnpm --filter @push/fo-mobile start      # Expo 개발 서버
pnpm --filter @push/fo-mobile ios        # expo run:ios
pnpm --filter @push/fo-mobile android    # expo run:android
pnpm --filter @push/fo-mobile test
pnpm --filter @push/fo-mobile lint       # expo lint
pnpm --filter @push/fo-mobile typecheck
```

Expo 패키지를 더할 때는 앱 디렉터리에서 `npx expo install <package>`를 써요. 규칙이 더 있으면 `apps/fo-mobile/AGENTS.md`에 있어요.

목업 API는 `EXPO_PUBLIC_API_MOCK`가 `1`일 때 `src/mock`을 써요. 예시는 `apps/fo-mobile/.env.example`이고, 복사 대상은 `.env.local`이에요.

Maestro 플로우는 `apps/fo-mobile/.maestro/`에 있어요. npm 스크립트와 CI에는 연결되어 있지 않아요.

### 웹·모바일 함께

```bash
pnpm --filter @push/fo-web --filter @push/fo-mobile --filter @push/api-client --filter @push/shared typecheck
pnpm --filter @push/fo-web --filter @push/fo-mobile --filter @push/api-client --filter @push/shared test
pnpm --filter @push/fo-mobile lint
pnpm --filter @push/fo-web build
```

## 환경 변수

값은 적지 않아요. 비우면 각 앱 코드에 있는 기본 주소를 써요. fo-web용 `.env.example`은 없어요.

| 이름 | 앱 | 읽는 곳 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | fo-web | `apps/fo-web/src/shared/api/client.ts` |
| `EXPO_PUBLIC_API_BASE_URL` | fo-mobile | `apps/fo-mobile/src/shared/infrastructure/config.ts` |
| `EXPO_PUBLIC_WEB_BASE_URL` | fo-mobile | 같은 파일. WebView로 여는 fo-web 주소 |
| `EXPO_PUBLIC_API_MOCK` | fo-mobile | `1`이면 목업 |
| `EXPO_PUBLIC_DEV_AUTH_TOKEN` | fo-mobile | `__DEV__` 빌드의 개발 로그인 |

웹은 `window.__PUSH__.apiBaseUrl`이 있으면 그 주소를 `VITE_API_BASE_URL`보다 먼저 써요.

## 화면

### fo-web

브라우저에서는 `app/shell.tsx` 안에 아래 경로가 있어요. `RequireAuth`가 붙은 경로는 로그인이 필요해요.

| 경로 | 화면 |
| --- | --- |
| `/` | 홈. 공개 |
| `/jobs` | 채용공고 목록. 공개 |
| `/search` | 검색. 공개 |
| `/login`, `/signup` | 로그인, 가입 |
| `/auth/callback`, `/auth/verify`, `/auth/reset` | OAuth 콜백, 이메일 인증, 비밀번호 재설정 |
| `/postings/:id` | 공고 상세. 공개 |
| `/profiles/:id` | 허브 프로필. 로그인 |
| `/hub`, `/social`, `/posts/:id` | 허브, 소셜, 게시물 |
| `/me` | 마이 |
| `/offers`, `/offers/:id` | 제안함 |
| `/notifications`, `/settings` | 알림, 설정 |
| `/employer/verify` | 사업자 확인 |
| `/employer/postings`, `…/new`, `…/:id/edit` | 공고 관리 |
| `/employer/postings/:id/applicants`, `…/:applicationId` | 지원자 |
| `/employer/chat`, `…/new`, `…/:id` | 기업 AI 채팅 |
| `/employer/members`, `/employer/plans` | 담당자, 요금제 |
| `/invites/:token` | 초대 수락 |

WebView에서는 `/postings/:id`와 `/profiles/:id`만 있어요.

코드는 Feature-Sliced Design이에요. `src/app`, `src/pages`, `src/features`, `src/entities`, `src/shared`.

### fo-mobile

Expo Router 파일은 `apps/fo-mobile/src/app/`예요. 탭 다섯 개 밖에 검색, 알림, 제안, 설정, 대화(`chat/[id]`), 게시물, 서류(`docs/[id]`)가 있어요. 공고 상세와 프로필 상세는 네이티브 크롬 안의 WebView로 fo-web을 열어요.

화면 컴포넌트는 `src/screens/`, 기능은 `src/features/`의 `auth`, `chat`, `home`, `hub`, `jobs`, `my`, `notifications`, `search`, `social`이에요.

## API 클라이언트

`@push/api-client`의 `createApi`가 묶는 영역은 `auth`, `postings`, `documents`, `jobs`, `search`, `profiles`, `me`, `posts`, `uploads`, `billing`, `sources`, `applications`, `conversations`, `companies`, `calendar`예요. 대화는 SSE `stream`과 이어 받기 `follow`를 포함해요. 오류 타입과 작업 상태 헬퍼(`jobs.ts`)도 같이 내보내요.

## 테스트·CI

```bash
pnpm --filter @push/fo-web test
pnpm --filter @push/fo-web typecheck
pnpm --filter @push/fo-web build
pnpm --filter @push/fo-mobile test
pnpm --filter @push/fo-mobile lint
pnpm --filter @push/fo-mobile typecheck
pnpm --filter @push/api-client test
pnpm --filter @push/api-client typecheck
pnpm --filter @push/shared test
pnpm --filter @push/shared typecheck
```

`.github/workflows/ci.yml`은 PR과 `develop`·`main` push, `workflow_dispatch`에서 `pnpm install --frozen-lockfile` 뒤에 `turbo run typecheck lint test`를 실행해요. 웹 프로덕션 빌드는 `pnpm --filter @push/fo-web build`예요. 웹 호스팅이나 스토어 제출 워크플로는 이 저장소에 없어요.

## 구조

```
apps/
  fo-mobile/          Expo. src/app, screens, features, shared, mock, providers, theme
  fo-web/             Vite. src/app, pages, features, entities, shared
packages/
  api-client/         @push/api-client
  shared/             @push/shared
docs/
  design/             Claude Design 시안
  plans/              구현 계획
assets/logo/          마스코트. 다크 타일 PNG·SVG, 투명 마크 SVG
```

투명 배경 마크는 `assets/logo/push-mark-dark-transparent.svg`와 `assets/logo/push-mark-white-transparent.svg`예요.

## 기여

브랜치는 `develop`에서 만들고, PR은 `develop`으로 올려요. `main`에는 릴리스 PR로 반영해요. 커밋과 PR 제목은 Conventional Commits를 따라요. 예: `docs(readme): …`. PR 본문은 `.github/PULL_REQUEST_TEMPLATE.md`를 써요.
