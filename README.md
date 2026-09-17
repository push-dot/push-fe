<p align="center">
  <img src="app-icon.png" width="96" alt="Push icon" />
</p>

<h1 align="center">Push FE</h1>

<p align="center">
  근거 수집부터 문서 작성과 지원 추적까지 관리하는 macOS 우선 데스크톱 앱의 프런트엔드.
</p>

## 스택

- **Tauri v2** — 네이티브 데스크톱 셸 (`src-tauri`, Rust)
- **React 19 + Vite** — UI
- **ky** — API 클라이언트 (`src/shared/api`)
- **Zustand** — 상태 관리
- **TipTap** — 문서 에디터
- **FSD** — `app` / `pages` / `features` / `entities` / `shared` 레이어 구조
- **Vitest + Testing Library** — 테스트

## 요구 사항

- Node.js 22+
- Rust stable, macOS Xcode (Tauri 빌드)
- 실행 중인 push-be API (기본 포트 8080)

## 시작하기

```sh
npm install
npm run dev          # Vite dev server → http://localhost:5173
cargo tauri dev      # src-tauri/에서 데스크톱 앱으로 실행
```

개발 인증은 `.env.development`의 `VITE_DEV_AUTH_TOKEN`과 서버의 `APP_ENV=development` + `DEV_AUTH_TOKEN`이 필요하다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 |
| `npm run build` | 타입 체크 + 프로덕션 번들 |
| `npm run test` | Vitest 단위 테스트 |
| `npm run typecheck` | `tsc --noEmit` |

## 구조

```
src/
  app/        라우트, 진입점, 전역 스타일
  pages/      화면 (chat, documents, applications, …)
  features/   사용자 기능 (chat, approval, job-add)
  entities/   도메인 모델 (document, evidence, job, …)
  shared/     api 클라이언트, auth, ui, lib, constants
src-tauri/    Tauri 셸, deep-link 플러그인
```

> [!NOTE]
> 이 저장소는 `push-workspace`의 git submodule로 연결되어 있다. 상위 저장소에서 작업할 때는 `git submodule update --init --recursive`로 체크아웃한다.
