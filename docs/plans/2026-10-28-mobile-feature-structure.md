# fo-mobile 기능 폴더 구조 통일

날짜: 2026-10-28. 기준: develop `f3d95cb`. 참고: ChatTeaDot/chattea-fe의 `apps/chattea-mobile` 기능 폴더 구조, 그리고 코드 규칙(`coding-hooks:frontend-native`, `coding-hooks:frontend`).

`apps/fo-mobile/src/features/` 아래 기능 9개(auth, chat, home, hub, jobs, my, notifications, search, social)를 모두 같은 틀로 맞춰요. 코드 내용은 바꾸지 않고, 파일 위치와 이름, 내보내기만 바꿔요.

## 목표 틀

```
features/<name>/
  api/
    fetchers.ts     HTTP 요청 함수
    schemas.ts      요청·응답 타입
    hooks.ts        TanStack Query hook (서버 데이터)
    index.ts        export * from "./fetchers", "./schemas", "./hooks"
  components/       UI 전부
    index.ts        export { default as X } from "./x"
  utils/            로직 파일을 평평하게 둠
    index.ts        export * from "./x"
  constants.ts
  types.ts
  hooks.ts          일반 hook만 (서버 데이터 hook은 두지 않음)
  stores.ts         Zustand, 화면 상태만
  index.ts          export * 로 모두 내보냄
```

어느 기준을 따르는지:

| 항목 | 기준 |
|---|---|
| `api/` 구성(`fetchers`·`schemas`·`hooks`·`index`), 서버 데이터 hook 위치, 루트 `hooks.ts` 역할, `stores.ts` | 코드 규칙 |
| `components/`, `utils/` 평평한 구조, 루트 파일 구성, `export *` 통일 | chattea-mobile |
| 기능 루트 내보내기 파일 이름 `index.ts` | 이번에 정함. 코드 규칙과 chattea는 `index.tsx`지만, 내보내기만 있고 JSX가 없어서 `.ts`가 맞아요. |

기능에 해당 파일이 필요 없으면 만들지 않아요. 예를 들어 화면 상태가 없는 기능에는 `stores.ts`를 만들지 않아요.

## 바꿀 것

### 1. 기능 루트 `index.tsx`를 `index.ts`로 바꾸기
- 기능 9개 모두 대상이에요.
- 내용은 전부 `export *`로 통일해요. 지금 chat은 파일마다 이름을 골라 내보내고 있어요. `export *`로 바꾸면서 같은 이름이 두 번 나오면, 겹치는 쪽 이름을 바꿔요.
- auth의 `index.tsx`는 `shared/infrastructure`의 함수(`signIn`, `signInWithDevToken`, `DEV_AUTH_TOKEN`)를 대신 내보내요. 이건 auth 기능 코드가 아니라서, 쓰는 쪽이 `@/shared/infrastructure`에서 직접 가져오게 바꿔요.

### 2. `api/`를 코드 규칙에 맞추기
- 서버 데이터 hook 74개는 지금처럼 `api/hooks.ts`에 그대로 둬요.
- `api/client.ts`(`chatApi`, `myApi`)는 `api/fetchers.ts`로 이름을 바꿔요.
- `api/client.ts` 안의 타입(`ChatDoc`, `Account`, `ConversationRow` 등)은 `api/schemas.ts`로 옮겨요.
- `api/files.ts`, `api/artifact-download.ts`는 서버 요청과 기기 기능이 섞여 있어요. 아래 "2-1"에 따라 함수별로 나눠 옮기고, 두 파일은 지워요.
- `api/index.ts`를 만들어 `fetchers`, `schemas`, `hooks`를 `export *`로 다시 내보내요. 기능 루트 `index.ts`는 `./api`를 내보내요.

### 2-1. 기기 기능은 `shared/infrastructure`, 기능별 값은 `constants.ts`
`utils/`는 값만 돌려주는 순수 함수를 두는 곳이에요. 파일 선택기, 캐시 저장, 공유 창, 링크 열기처럼 기기에 무언가를 하는 코드는 `utils/`에 두지 않아요. 기기 기능은 이미 `src/shared/infrastructure/platform.ts`(`pickDocument`, `pickImage`, `openBrowser`)에 모여 있어요. 기능별 `files.ts`는 대부분 이걸 한 번 감싼 것이고, 기능마다 다른 건 받을 파일 형식 같은 값뿐이에요.

| 지금 있는 곳 | 함수 | 하는 일 | 옮길 곳 |
|---|---|---|---|
| `chat/api/files.ts` | `pickChatDoc`, `pickChatAttachment` | 문서 선택기 | 없애요. 쓰는 곳에서 `pickDocument`를 바로 부르고, 형식 목록은 `constants.ts`로 |
| | `CHAT_DOC_TYPES`, `CHAT_ATTACHMENT_TYPES` | 받을 파일 형식 | `chat/constants.ts` |
| | `saveToCache` (내부 함수) | 기기 캐시에 저장 | `shared/infrastructure/platform.ts` |
| | `openArtifact` | 받기 → 저장 → 공유 창 | 나눠요. 받기는 `api/fetchers.ts`, 저장과 공유는 `platform.ts`. 셋을 이어 붙이는 건 이미 있는 `useOpenArtifact`(`api/hooks.ts`) 안에서 해요. |
| | `openExternal`, `openLink` | 브라우저·외부 앱으로 링크 열기 | 없애요. `platform.ts`의 `openBrowser`와 새 `openUrl`을 바로 불러요. |
| `chat/api/artifact-download.ts` | `cacheName` | 저장할 파일 이름 정리 (순수 함수) | `chat/utils/` |
| | `downloadArtifact` | 받기(`get`)와 저장(`save`)을 주입받아 이어 붙이기 | 없애요. 이어 붙이는 일은 `useOpenArtifact`가 해요: `fetchers.ts`의 받기 → `platform.ts`의 `saveToCache` → `shareFile`. 기존 테스트는 `cacheName` 테스트로 남겨요. |
| `my/api/files.ts` | `pickAvatarImage`, `pickResumeFile` | 사진·이력서 선택기 | 없애요. `pickImage`·`pickDocument`를 바로 부르고, 옵션은 `my/constants.ts`로 |
| | `uploadAvatarImage` | 사진을 서버에 올리기 | `my/api/fetchers.ts` |
| | `signOutSession`, `deleteAccountSession` | 로그아웃·계정 삭제 요청 | `my/api/fetchers.ts` |

- `platform.ts`에 새로 넣는 함수는 `saveToCache`, `shareFile`(공유 창), `openUrl`(외부 앱 링크) 세 개예요. 기능 이름이 들어가지 않는 일반 함수로 만들어요.
- 기능 안에 기기 전용 폴더(`device/` 같은)는 만들지 않아요. 기능별 차이가 값뿐이라 폴더를 만들면 껍데기 파일이 돼요.
- 코드 규칙 `frontend-native`도 같은 내용으로 고쳤어요(기기 기능은 `src/shared/infrastructure/`, `utils/`는 순수 함수만).

### 3. 루트 `hooks.ts`는 일반 hook만
- 다른 파일 안에 있는 일반 hook을 루트 `hooks.ts`로 옮겨요. 예: chat `motion.tsx`의 `useReduceMotion`.
- my의 `hooks.ts`(`useToast` 등)는 이미 맞아요.

### 4. `stores.ts`
- search의 `stores.ts`는 이미 맞아요.
- chat의 `store.ts`는 `stores.ts`로 이름을 바꿔요.

### 5. `utility/<함수>/<함수>.ts`를 `utils/<함수>.ts`로 평평하게
- 함수 폴더 32개를 없애요. my 19, social 4, jobs 3, hub 2, notifications 2, chat 1, search 1이에요.
- `utils/index.ts`에서 `export * from "./x"`로 내보내요.

### 6. chat 루트 정리
- UI 15개는 `components/`로 옮겨요: `account-modal`, `links-modal`, `bookmarks-modal`, `docs-modal`, `composer`, `composer.ios`, `composer.android`, `composer-area`, `composer-body`, `drawer`, `items`, `approval-panel`, `status-row`, `quick-start-sheet`, `motion`.
- 플랫폼별 파일(`composer.ios.tsx`, `composer.android.tsx`)은 이름을 그대로 두고 같은 폴더로 함께 옮겨요.
- `links`, `mentions`, `reducer`, `stream`, `quick-start-data`는 `utils/`로 옮겨요.
- `quick-starts`는 데이터라서 `constants.ts`로 합쳐요.

### 7. 기능끼리 가져오는 경로
- 기능 사이를 상대 경로로 가져오는 3곳을 `@/features/<name>`으로 바꿔요. 예: chat의 `../../my/api/client`.
- 기능 밖에서 기능 안쪽을 깊은 경로로 가져오는 곳은 이미 0개예요.

### 8. 코드 규칙 문구 고치기
- `coding-hooks:frontend-native` 스킬의 "feature 루트는 `index.tsx`" 문구를 `index.ts`로 고쳐요. 그래야 나중에 다시 `index.tsx`로 되돌아가지 않아요.

## 정해야 할 것

| 항목 | 내용 | 추천 |
|---|---|---|
| chat `stores.ts`의 서버 데이터 | 코드 규칙은 "서버 데이터를 store에 복사하지 않는다"예요. chat store에는 SSE로 받은 대화 메시지가 들어 있어요. | 이번에는 이름만 바꾸기. 메시지를 TanStack Query로 옮기는 건 동작이 바뀌는 일이라 따로 해요. |
| 래퍼가 없는 기능의 `fetchers.ts` | home, hub, jobs, social 등은 `api/hooks.ts` 안에서 `api.xxx`를 바로 불러요. 코드 규칙은 "HTTP 요청은 `fetchers.ts`"예요. | 규칙대로 `fetchers.ts`로 빼기. 기능마다 hook의 `queryFn`·`mutationFn` 안의 호출만 옮겨요. |
| 테스트 위치 | 지금은 chat의 `__tests__/`와 `utility/` 안에 있어요. chattea는 앱 루트 `test/`에 모아요. | 이번에는 그대로 두기. 기능 폴더 구조와 별개라서 따로 정해요. |

## 진행 방식

- 기능마다 develop에서 브랜치를 만들고 PR을 하나씩 올려요.
- 순서는 작은 기능부터예요: home, search, notifications, auth → hub, social, jobs → my → chat. chat이 제일 커서 마지막이에요.
- 첫 PR에서 기능 9개의 `index.tsx`를 `index.ts`로 한꺼번에 바꿔요. 이후 PR들이 같은 파일 이름을 기준으로 작업할 수 있게요.
- PR마다 `pnpm --filter @push/fo-mobile typecheck`, `lint`, `test`를 통과시켜요.
- PR #115(채팅 문서 캐시 버그)를 먼저 머지해야 해요. chat과 my의 같은 파일을 건드려서 충돌해요.
- 패키지 매니저는 pnpm만 써요.

예상 시간: 하루 정도. chat 2~3시간, my 1~2시간, 나머지는 기능당 20~40분.
