# 번들 최적화

`vite build` 기준 측정 (vite 6.4.3, React 19, Tauri v2). gzip은 vite 출력값.

## 결과 요약

| 구분 | Before | After | 변화 |
|---|---|---|---|
| 초기 JS (raw) | 1,067.86 kB | 564.90 kB | **-47.1%** |
| 초기 JS (gzip) | 335.24 kB | 174.69 kB | **-47.9%** |
| CSS (raw / gzip) | 47.05 / 7.42 kB | 47.05 / 7.42 kB | 동일 |

## Before

`src/pages/index.ts` 배럴이 모든 페이지를 eager re-export하고, `src/app/routes.tsx`가
`import { LoginPage } from '@/pages'`로 배럴을 경유했다. `package.json`에 `sideEffects`
필드가 없어 Rollup이 미사용 re-export를 제거하지 못하고, 결과적으로 lazy 페이지의
의존성(@tiptap, react-markdown)이 엔트리 청크에 들어갔다. 같은 방식으로
`main.tsx`·`conversation-list.tsx` 등의 eager 코드가 `@/features/chat` 배럴을 통해
`components/` 전체(= react-markdown)를 eager로 끌어왔다.

| 청크 | raw | gzip | 비고 |
|---|---|---|---|
| index (entry) | 1,067.63 kB | 335.05 kB | tiptap·react-markdown 포함 |
| lazy pages 합계 | ~60 kB | ~25 kB | 코드 스플릿 사실상 무력화 |

## After

| 청크 | raw | gzip | 로드 시점 |
|---|---|---|---|
| index | 300.00 kB | 93.10 kB | 초기 (entry) |
| vendor-react | 224.20 kB | 69.52 kB | 초기 (modulepreload) |
| vendor-query | 40.70 kB | 12.07 kB | 초기 (modulepreload) |
| vendor-tiptap | 396.58 kB | 126.25 kB | **lazy** — doc-editor 진입 시 |
| chat-page | 133.54 kB | 43.21 kB | **lazy** — react-markdown 포함 |
| doc-editor-page | 1.60 kB | 0.89 kB | lazy |
| 기타 페이지 | 0.3~9.0 kB | — | lazy |

## 변경 내용

1. **Import 경로 수정** (감축의 대부분)
   - `routes.tsx`: `@/pages` 배럴 대신 `@/pages/login-page`, `@/pages/home-page` 직접 import
   - `main.tsx`: `@/features/chat/lib/inference-bridge`, `@/features/inference/stores` 직접 import
   - `conversation-list/item/menu.tsx`: `@/features/chat` 배럴 대신 `api/hooks`·`stores`·`api/schemas` 직접 import
   - `home-page.tsx`: `Composer`·`useFileDrop`·`useCreateConversation`을 개별 모듈에서 직접 import

2. **manualChunks** (`vite.config.ts`)
   - `vendor-react`: react, react-dom, scheduler
   - `vendor-query`: @tanstack/react-query
   - `vendor-tiptap`: @tiptap/*, prosemirror/* — lazy 유지 (index.html preload 없음 확인)
   - 초기 총량 자체는 거의 동일(566.55→564.90 kB). 목적은 캐시 분할: 라이브러리와 앱 코드의
     갱신 주기가 달라 vendor 청크는 배포 간 캐시가 유지된다. `index.html`에 modulepreload로
     선언돼 병렬 다운로드된다.

## 결정 사항

- **배럴 파일은 유지**: 페이지/피처의 public API로서 `index.ts`는 그대로 두고, 엔트리 경계에
  위치하는 파일(routes, main, app shell)만 deep import로 우회했다. 대안인
  `"sideEffects": false`는 stores·i18n 같은 사이드이펙트 모듈 drop 위험이 있어 채택하지 않았다.
- **vendor-tiptap은 수동 청크지만 lazy**: @tiptap을 import하는 모듈이 lazy 페이지뿐이면
  manualChunks로 이름을 붙여도 해당 청크는 지연 로드된다. entry preload 목록으로 확인 가능.
- **react-router, ky, zustand, @sentry는 별도 분리 안 함**: entry 청크에 두고 향후 규모가
  커지면 재검토.
- **Tauri 영향 없음**: `vite.config.ts`는 tauri build가 공유하지만 manualChunks는 웹 에셋
  청킹만 바꾼다. `npx tauri build` 검증은 별도.

## 재측정 방법

```bash
npm run build   # dist/assets/*.js 크기 + gzip 표 출력
```
