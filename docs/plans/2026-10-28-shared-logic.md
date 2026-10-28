# fo-web과 fo-mobile에 따로 있는 같은 로직 합치기

날짜: 2026-10-28. 기준: develop `e2141f3`. 근거: push-fe graphify 그래프(노드 4,460개, 엣지 13,016개)에서 fo-web과 fo-mobile에 같은 이름으로 있는 함수 40개를 찾았어요. 이 중 순수 로직은 diff로 실제 코드를 비교했어요.

fo-desktop은 이 계획에서 다루지 않아요.

## 1. 한글 검색을 하나로 합치기 (우선순위 1)

두 앱에 같은 알고리즘이 따로 구현돼 있고, 이미 내용이 갈라졌어요.

| 파일 | 줄 수 | 쓰는 곳 |
|---|---|---|
| `apps/fo-mobile/src/shared/utility/hangul-search/hangul-search.ts` | 66 | `searchHangul` 7곳, `matchHangul` 3곳 |
| `apps/fo-web/src/shared/lib/hangul-search.ts` | 64 | `searchHangul` 3곳, `matchHangul` 2곳 |

두 파일은 54줄이 달라요. 웹에만 하이라이트 위치를 계산하는 `findBy`·`offset` 로직이 있어요. 그래서 같은 검색어라도 웹과 모바일에서 강조 범위가 다르게 나올 수 있어요.

- 새 패키지 `packages/shared`(`@push/shared`)를 만들고, 한글 검색을 `src/hangul-search.ts`로 옮겨요. 의존성은 `es-hangul` 하나예요. 두 앱 모두 이미 `es-hangul@^2.4.0`을 써요.
- 두 앱에 모두 `hangul-search.test.ts`가 있어요. 두 테스트 파일을 합쳐서, 두 구현에 각각 돌려 봐요. 둘이 다르게 동작하는 입력이 나오면 Claude Design 시안의 검색 화면(WebSearch)을 기준으로 맞는 쪽을 골라요. 고른 동작은 테스트로 고정한 다음 합쳐요.
- 두 앱의 기존 파일은 지우고, import를 `@push/shared`로 바꿔요. 두 앱 `package.json`에 `"@push/shared": "workspace:*"`를 추가해요.
- 패키지 구성은 `@push/api-client`를 따라요. `exports`에 `./src/index.ts`를 두고, 스크립트는 `typecheck`와 `test`를 넣어요.

확인 방법:
- 두 앱의 기존 한글 검색 테스트를 `packages/shared`로 옮긴 뒤 모두 통과해야 해요.
- 같은 검색어가 두 앱에서 같은 강조 범위를 돌려주는 테스트를 추가해요.
- `pnpm check`가 통과해야 해요.

예상 시간: 1~2시간

## 2. 경력 표시 문구를 시안에 맞추기 (우선순위 2)

지금은 플랫폼마다 문구가 달라요.

| 앱 | 지금 출력 | 쓰는 곳 |
|---|---|---|
| fo-mobile `careerLabel` (`shared/utility/posting-label`) | `4–6년`, `신입`, `4년+` | 6곳 |
| fo-web `careerLabel` (`shared/lib/format`) | `경력 4–6년`, `신입`, `경력 4년+` | 8곳 |

Claude Design 시안은 쓰이는 자리에 따라 문구가 달라요.
- 목록과 검색 결과 줄에서는 짧게 써요: `서울 강남구 · 4–6년` (WebJobs, WebSearch)
- 공고 상세 상단에서는 "경력"을 붙여요: `서울 강남구 · 경력 4–6년 · 정규직` (WebJobGuest, WebApply, WebApplied)

할 일:
- `careerLabel`을 `@push/shared`로 옮기고, 짧은 형식(`4–6년`, `신입`, `4년+`)을 돌려주게 해요.
- 공고 상세처럼 "경력"이 붙는 자리에서는 호출하는 쪽에서 `경력 ` 접두어를 붙여요. 단, `신입`에는 붙이지 않아요.
- fo-web 8곳을 하나씩 확인해서 목록이면 짧게, 상세면 접두어를 붙여요.
- 함수 인자는 하나로 맞춰요. 지금은 모바일이 `Pick<Posting, 'careerMin' | 'careerMax'>`, 웹이 `(min, max)`를 받아요.

확인 방법:
- 입력별 출력 테스트를 추가해요. 대상은 신입, 범위, 상한 없음이에요.
- 화면별 결과가 위 시안과 같아야 해요.

예상 시간: 약 1시간

## 3. 같은 코드가 복사된 작은 함수 합치기 (우선순위 3)

지금은 내용이 같지만, 한쪽만 고치면 앱과 웹에서 결과가 달라져요.

| 함수 | fo-mobile | fo-web | 비고 |
|---|---|---|---|
| `brandOf` + `BRAND` 색 7개 | `shared/utility/posting-label` (4곳) | `shared/lib/format` (17곳) | 회사 이름으로 대표 색을 고르는 함수예요. 지금은 코드가 똑같아요. |
| `fileSize` | `features/my/utility/file-size` (4곳) | `pages/my/document-file-row.tsx` (1곳) | 파일 크기 표시 |
| `monthDay` | `features/my/utility/month-day` (7곳) | `pages/posting/posting-actions.tsx` (1곳) | 날짜 표시 |

- 세 함수를 `@push/shared`로 옮기고 두 앱의 import를 바꿔요.
- 옮기기 전에 두 구현의 출력이 같은지 테스트로 확인해요. 다르면 Claude Design 시안을 기준으로 하나를 골라요.

확인 방법: 함수마다 테스트를 추가하고, `pnpm check`가 통과해야 해요.

예상 시간: 약 1시간

## 합치지 않을 것

| 항목 | 이유 |
|---|---|
| `ApplySheet`, `PostCard`, `Toast`, `FilterSheet` 같은 UI 컴포넌트 | React Native와 웹 DOM은 컴포넌트를 공유할 수 없어요. |
| `createPkce`, `toBase64Url` | 모바일은 `expo-crypto`, 웹은 브라우저 Web Crypto를 써요. 난수와 해시를 만드는 방법이 플랫폼마다 달라요. |
| `useOffers`, `useMyProfile` 같은 조회 hook 약 17개 | 두 앱은 캐시가 서로 분리돼 있어서, 조회 키가 달라도 문제가 없어요. |
| `assetUrl` | 두 앱 모두 이미 `@push/api-client`의 `absoluteUrl`을 써요. 각 앱은 자기 API 주소만 넣어서 감싼 한 줄짜리 함수예요. |
| `mockFetch`, 목업 데이터 | 목업 모드 전용이고, 두 앱의 목업 범위가 달라요. |

## 작업 방식

- 작업마다 develop에서 브랜치를 만들고 PR을 따로 올려요. 순서는 1 → 2 → 3이에요. 2와 3은 1에서 만든 `@push/shared`를 써요.
- 패키지 매니저는 pnpm만 써요.
- 끝나면 `graphify --update`로 그래프를 다시 만들어서, fo-web과 fo-mobile에 같은 이름으로 남은 순수 함수가 없는지 확인해요. 결과는 workspace의 `graphify-out/push-fe`에 저장돼요.
