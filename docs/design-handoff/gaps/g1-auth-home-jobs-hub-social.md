# G1 갭 분석 — Auth · Home · 채용공고 · 공고 상세 · Hub · Social (44 아트보드)

- 디자인: `docs/design-handoff/push-app/{01-Auth,02-Home,03-채용공고,04-공고-상세,11-Hub,12-Social}.html` (중첩 번들을 풀어 각 아트보드의 DOM 텍스트를 읽음)
- 앱: `push-fe` develop `fc4c872`, `apps/fo-mobile/src` (경로는 이 폴더 기준). 공고 상세·프로필 상세 본문은 `DetailWebView`로 띄우는 **fo-web** 화면이라 `apps/fo-web/src/pages/{posting,profile}`까지 비교함.
- 계약 확인: `push-be` `c558b73` `packages/contracts/openapi.json`
- 크기: S = 문구·간격·색·아이콘만 / M = 한 화면 안의 컴포넌트·상태 변경 / L = 새 화면·내비·구조·네이티브 컴포넌트 교체. [OK]만 있는 아트보드는 크기 `—`.

공통 사항(아래 각 아트보드에서 반복하지 않음)
- 시트: 디자인의 모든 시트(`sheet2` + grabber)는 앱에서 `shared/components/bottom-sheet.tsx:55-79` — RN `Modal` + iOS `Glass`(expo-glass-effect)로 그린 JS 시트. 네이티브 시트(detent, 드래그로 닫기)가 아님.
- 탭 바: `app/(tabs)/_layout.tsx:5` `NativeTabs`(네이티브, `minimizeBehavior="onScrollDown"`) — 디자인과 일치.
- 상단 바: `shared/components/top-bar.tsx` 커스텀 + `GlassButton`(iOS는 expo-glass-effect). 모든 Stack이 `headerShown: false`(`app/_layout.tsx:24`). 디자인도 커스텀 유리 버튼이라 그대로 맞음.
- 로딩: 디자인은 전부 스켈레톤(+ `sr-only` "불러오는 중"). 앱은 전부 `shared/components/loading-note.tsx`(ActivityIndicator + "불러오는 중" 글자) 또는 ActivityIndicator.

---

## 01-Auth

### 01-Auth › 로그인
크기: M
- [없음] 148px 마스코트 로고(`Push 로고` SVG). 앱은 글자 워드마크 "Push." (`screens/auth/sign-in-screen.tsx:77-79`). `shared/components/mascot.tsx`는 있지만 여기서 안 씀.
- [문구] 제목: 디자인 "AI와 함께 하는 커리어,\nPush에서 시작하기" vs 앱 "공고에 맞는 이력서,\n대화로 만들어요" (`screens/auth/sign-in-screen.tsx:81`)
- [추가] 부제 "데스크톱 앱과 같은 계정으로 로그인하면\n대화와 서류가 그대로 이어져요." (`screens/auth/sign-in-screen.tsx:84`) — 디자인에 없음
- [추가] 하단 고지 "계속하면 이용약관과 개인정보 처리방침에 동의하게 돼요." (`screens/auth/sign-in-screen.tsx:117`) — 디자인에 없음(약관은 가입 단계에서 받음)
- [상태] "휴대폰 번호로 시작하기": 디자인은 배경 없는 글자 버튼(15px/600, t2). 앱은 `Button variant="secondary"` 꽉 찬 버튼 (`screens/auth/sign-in-screen.tsx:104`)
- [OK] Google / Apple(iOS만) / GitHub 버튼 순서·문구·로고, Android에서 Apple 숨김(`features/auth/utils/auth-flow.ts:69`)

### 01-Auth › 휴대폰 번호 입력 · Google/GitHub 로그인 후
크기: M
- [상태] 소셜 이메일: 디자인은 bg2 알약(999px) 안에 제공자 아이콘(Google 로고) + 이메일. 앱은 아이콘 없는 c1 t3 글자 (`screens/auth/phone-screen.tsx:57-61`). 어떤 제공자로 들어왔는지 store에 없음(`beginSocial(pendingToken, email)`만 저장, `screens/auth/sign-in-screen.tsx:31`).
- [상태] 번호 필드: 디자인은 "+82 ⌄" 칸과 번호 칸이 분리된 두 박스(국가번호 고르기 모양), 포커스 시 2px ac 테두리. 앱은 한 박스 안에 "+82 | 입력" (`features/auth/components/phone-field.tsx:8-32`), 국가번호 고르기 없음(`toE164`는 한국 번호만, `features/auth/utils/auth-flow.ts:88-92`). 디자인에 국가 선택 화면은 없음.
- [OK] 제목/본문/CTA "인증번호 받기" (`features/auth/constants.ts:16-18`)

### 01-Auth › 휴대폰 번호 인증
크기: M
- [상태] 디자인은 칸 아래 한 줄에 왼쪽 "2:48 후에 다시 받을 수 있어요" + 오른쪽 "번호 바꾸기". 앱은 카운트다운만 칸 아래(`screens/auth/otp-screen.tsx:174-184`), "번호 바꾸기"는 CTA 위 별도 버튼(`screens/auth/otp-screen.tsx:187-191`).
- [추가] 카운트다운이 끝나면 앱은 "인증번호 다시 받기" 글자 링크를 띄움(`screens/auth/otp-screen.tsx:179-183`) — 디자인 이 아트보드엔 없음(만료 상태에서만 CTA로 나옴).
- [OK] 제목, "010-1234-5678로 6자리 번호를 보냈어요." (`features/auth/utils/auth-flow.ts:114`), 6칸, CTA "확인"

### 01-Auth › 가입 · 약관 동의
크기: M
- [상태] "전체 동의": 디자인은 bg2 카드(padding 16, r-card) 안에 26px 둥근 사각 체크박스. 앱은 카드 없이 일반 행 (`screens/auth/terms-screen.tsx:68`).
- [상태] 체크박스 모양: 디자인 둥근 사각(radius 8), 꺼짐은 2px t3 테두리. 앱은 원형(radius 12), 꺼짐은 fill 배경 (`features/auth/components/term-row.tsx:24-35`).
- [없음] 서비스 이용약관 / 개인정보 수집·이용 / 혜택·이벤트 알림 받기 행 오른쪽 "자세히 보기" 꺾쇠(44px) 링크. 앱은 없음(`features/auth/components/term-row.tsx` 전체, `TERM_ROWS`에 URL 없음 `features/auth/constants.ts:41-46`).
- [OK] 제목/본문/라벨/필수·선택 배지/CTA "동의하고 시작하기"

### 01-Auth › 휴대폰 번호 입력 · 휴대폰 번호로 시작하기
크기: S
- [상태] "+82 ⌄" 분리 박스·포커스 테두리 — 위 "Google/GitHub 로그인 후"와 같은 차이 (`features/auth/components/phone-field.tsx:8-32`)
- [OK] 이메일 줄 없음, 제목/본문/CTA

### 01-Auth › 인증번호 · 5번 초과
크기: S
- [없음] 디자인은 제목 아래 빈 6칸을 그대로 보여 줌. 앱 차단 화면엔 칸이 없음 (`screens/auth/otp-screen.tsx:111-138`).
- [추가] 앱은 남은 시간 "m:ss 후에 다시 받을 수 있어요"를 보여 주고 CTA를 막음 (`screens/auth/otp-screen.tsx:122-126,134`) — 디자인에 없음.
- [OK] "인증번호를 5번 잘못 입력했어요" / "새 인증번호를 받아 다시 입력해 주세요." / "인증번호 다시 받기"

### 01-Auth › 이미 가입된 번호
크기: —
- [OK] "이 번호는 {Google} 계정으로 가입돼 있어요. {Google}로 로그인해 주세요.", 여러 개면 "Google 또는 GitHub" (`features/auth/utils/auth-flow.ts:50-58`), CTA "{p}로 로그인" + "다른 번호 입력하기" (`screens/auth/phone-registered-screen.tsx:88-97`)

### 01-Auth › 로그인 · 오류
크기: M
- [상태] 소셜 로그인 실패(Google/Apple/GitHub): 디자인은 화면 위쪽(top+16) redSoft 배너, 왼쪽 빨간 "!" + 굵은 제목 + c1 t2 본문. 앱은 버튼 위 가운데 정렬 빨간 글자 두 줄 (`screens/auth/sign-in-screen.tsx:89-98`). 문구는 일치(`features/auth/utils/auth-flow.ts:74-77`, `features/auth/constants.ts:9`).
- [상태] 인증번호 틀림/만료: 디자인은 오류 문구가 카운트다운 자리(칸 아래 한 줄, 오른쪽 "번호 바꾸기")를 대신함. 앱은 오류 문구 + 카운트다운/재전송 링크가 따로 쌓임 (`screens/auth/otp-screen.tsx:159-184`).
- [OK] "인증번호가 맞지 않아요. 다시 확인해 주세요." / "인증번호가 만료됐어요. 새 번호를 받아 주세요." / 만료 시 CTA "인증번호 다시 받기" (`screens/auth/otp-screen.tsx:192-196`)

---

## 02-Home

### 02-Home › 홈 · 스크롤 전
크기: —
- [OK] "Push." 워드마크 + 검색 + 알림(배지 "알림 3개") (`screens/home/home-screen.tsx:16-26`), 바로가기 3개 채용공고/북마크/내 활동(100px, 22 radius, 3D 아이콘, 방사 그라데이션) (`features/home/constants.ts:8-12`, `features/home/components/shortcut.tsx`), 섹션 "새로 올라온 공고/마감 임박 공고/이번 주 많이 본 공고" + "전체보기 ›" (`features/jobs/constants.ts:27-31`), 200×136 카드·북마크 버튼 (`shared/components/job-card.tsx`)
- [네이티브] 탭 바 = `NativeTabs` (일치)

### 02-Home › 홈 · 스크롤 후
크기: —
- [OK] 상단 바 고정, 아래로 스크롤 시 탭 바 최소화
- [네이티브] iOS 탭 바 최소화(`minitab`) = `NativeTabs minimizeBehavior="onScrollDown"` (`app/(tabs)/_layout.tsx:5`) — 네이티브로 이미 구현

### 02-Home › 홈 · 마감 임박 공고 전체보기
크기: —
- [OK] 제목 "마감 임박 공고", 설명 "일주일 안에 마감되는 공고예요", 2열(169px) 카드 그리드, 탭 바 보임 (`screens/jobs/section-screen.tsx`, `features/jobs/components/posting-grid.tsx:20,28`, 라우트 `app/(tabs)/(home)/section/[kind].tsx`)

### 02-Home › 알림함
크기: S
- [상태] 안 읽은 알림 본문: 디자인은 굵기 그대로(b2, t1), 읽은 알림만 t2. 앱은 안 읽음이면 weight 600 (`features/notifications/components/notification-row.tsx:38`).
- [OK] "알림" + "모두 읽음", 오늘/이번 주/이전 묶음, 종류별 아이콘 타일, 시간 표기(방금/10분 전/오전 9:00/어제/10월 17일) (`features/notifications/utils/format.ts`), 안 읽음 점

### 02-Home › 검색 · 최근 검색어
크기: S
- [상태] "지금 많이 찾는 검색어"가 하드코딩 (`features/search/constants.ts:1-2`). push-be에 `GET /api/v1/search/trending`(terms 상위 8개)이 이미 있음 → 앱이 안 씀 (FE만 고치면 됨).
- [OK] 검색 필드 "회사, 직무, 기술 검색" + "취소", "최근 검색"/"모두 지우기", 시계 아이콘·x, 순위 2열 (`screens/search/search-screen.tsx:40-101`, `features/search/components/search-bar.tsx`)

### 02-Home › 검색 · 결과
크기: S
- [상태] 하이라이트: 디자인은 제목만 강조, 회사명은 강조 안 함. 앱은 회사명도 강조 (`features/search/components/posting-row.tsx:` 회사 `<Highlight text={p.company}>`).
- [상태] 북마크 아이콘 20px, 행 간격 16. 앱 22px, 간격 14 (`features/search/components/posting-row.tsx`).
- [OK] 칩 "공고 24/사람 8/게시글 13", "‘백엔드’ 공고 24개", "관련도순 ⌄" (`screens/search/search-screen.tsx:113-129`)
- [네이티브] "관련도순 ⌄"는 꺾쇠가 있지만 앱은 눌러지지 않는 글자 (`screens/search/search-screen.tsx:123-128`). 디자인에 정렬 메뉴 화면은 없음 — 만든다면 iOS pull-down 메뉴 / Android 드롭다운 후보.

### 02-Home › 알림함 · 상태
크기: S
- [없음] 빈 상태 64px 아이콘 타일(fill 배경, 종 아이콘). 앱은 글자만 (`screens/notifications/notifications-screen.tsx:61-65` → `shared/components/status-note.tsx`).
- [상태] 빈 상태 문구 스타일: 디자인 b1 w7 t2, 세로 가운데. 앱 b2 t3, marginTop 40.
- [OK] "아직 받은 알림이 없어요." / 권한 꺼짐이면 "알림 설정" 버튼 (`features/notifications/constants.ts:2-3`), 모두 읽은 뒤 "모두 읽음" 비활성 (`screens/notifications/notifications-screen.tsx:40`)

### 02-Home › 홈 · 검색 · 상태
크기: M
- [OK] 섹션 실패 "공고를 불러오지 못했어요.\n잠시 후 다시 열어 주세요." + "다시 시도" (`features/home/constants.ts:5-6`, `features/home/components/section.tsx:36-37`)
- [상태] 결과 없음: 디자인은 제목+본문을 한 덩어리 b1 w7로. 앱은 StatusNote b2 t3 두 줄 (`screens/search/search-screen.tsx:147-151`). 문구는 일치(`features/search/utils/empty-copy.ts:1`, `features/search/constants.ts:6-7`).
- [문구] 사람 결과 수: 디자인 "‘백엔드’ 사람 8명" vs 앱 "‘백엔드’ 사람 8개" (`screens/search/search-screen.tsx:121`, 단위 `개` 고정)
- [상태] 사람·게시글 탭엔 디자인에 "관련도순"이 없음. 앱은 모든 탭에 보임 (`screens/search/search-screen.tsx:123-128`).
- [상태] 사람 행: 디자인은 헤드라인 b2 t2 + 오른쪽 꺾쇠. 앱은 헤드라인 c1 t3, 꺾쇠 없음 (`features/search/components/person-row.tsx`).
- [상태] 게시글 행: 디자인 순서 = "이수빈 · 커리어 · 2시간 전"(c2) → 제목 → 말풍선 아이콘 + "댓글 24". 앱 = 제목 → 본문 한 줄 → 메타 → "댓글 24"(아이콘 없음) (`features/search/components/post-row.tsx`). [추가] 본문 미리보기 줄.

### 02-Home › 홈 · 검색 · 알림 · 로딩
크기: M
- [상태] 홈: 디자인은 바로가기는 보이고 섹션은 스켈레톤(카드 자리). 앱은 섹션마다 196px 영역에 스피너+"불러오는 중" (`features/home/components/section.tsx:32-35`).
- [상태] 검색 결과: 디자인 행 스켈레톤. 앱 `LoadingNote` (`screens/search/search-screen.tsx:142-143`).
- [상태] 알림함: 디자인 행 스켈레톤, "모두 읽음" 활성 모양. 앱 `LoadingNote`(`screens/notifications/notifications-screen.tsx:54-55`), 로딩 중 "모두 읽음"은 비활성(`unread=false`).

### 02-Home › 홈 · 큰 글씨
크기: —
- [OK] 디자인은 글자 크기만 키우고(.xl: h2 26, b1 21, c1 17 …) 카드 200×136·바로가기 100px 높이는 그대로. 앱 RN `Text`는 기본으로 시스템 글자 크기를 따름(`allowFontScaling`을 끈 곳 없음). 고정 높이도 디자인과 같음. 잘림 여부는 실기기 확인 필요(코드로는 판단 불가).

---

## 03-채용공고

### 03-채용공고 › 채용공고 · 전체 목록
크기: —
- [OK] "채용공고" + 뒤로 + 검색, 칩 전체/직군⌄/기술 스택⌄/경력⌄/지역⌄/고용형태⌄, "공고 1,284개", "최신순 ⌄", 2열 카드, 탭 바 보임 (`screens/jobs/job-list-screen.tsx`, 라우트 `app/(tabs)/(home)/jobs.tsx`)
- [네이티브] "최신순 ⌄"는 눌러지지 않는 글자 (`screens/jobs/job-list-screen.tsx:40-45`). 디자인에 정렬 메뉴 화면 없음 — 만든다면 네이티브 메뉴 후보.

### 03-채용공고 › 채용공고 · 경력 필터
크기: S
- [문구] 칩: 디자인 "경력 4–6년" vs 앱 "4–6년" (`features/jobs/utils/filters.ts:33-34` → `chipLabel`, `packages/api-client/src/labels/chip-label.ts:1-2`). 단, 디자인 안에서도 고용형태는 "정규직"(접두어 없음), 빈 상태는 "경력 · 4–6년"이라 규칙이 엇갈림 → 디자인 쪽 확정 필요.
- [상태] 디자인은 필터를 걸어도 "전체" 칩이 켜진 채. 앱은 필터가 있으면 "전체"가 꺼짐 (`screens/jobs/job-list-screen.tsx:31`). 빈 상태 아트보드에선 디자인도 "전체"가 꺼져 있어 디자인 쪽 불일치.
- [네이티브] 필터 시트 = JS 시트 (공통 사항)
- [OK] "경력" + "초기화", "여러 개 고를 수 있어요", 신입/1–3년/4–6년/7–9년/10년+, "공고 386개 보기" (`features/jobs/components/filter-sheet-body.tsx:28-43`)

### 03-채용공고 › 채용공고 · 직군 필터
크기: S
- [상태] "전체" 칩 켜짐 — 위와 같음
- [네이티브] JS 시트
- [OK] "개발 외 1", 개발/데이터/디자인/기획/마케팅/영업/인사/경영지원 (`packages/api-client/src/labels/catalogs.ts:3-12`), "공고 512개 보기"

### 03-채용공고 › 채용공고 · 기술 스택 필터
크기: S
- [상태] "전체" 칩 켜짐 — 위와 같음
- [네이티브] JS 시트
- [OK] "Kotlin 외 2", "기술 검색" 필드, "선택한 기술"(x 칩)/"내 프로필 기술"/"많이 찾는 기술" (`features/jobs/components/filter-skills.tsx`)
- 참고: "많이 찾는 기술"은 하드코딩 (`features/jobs/constants.ts:18`). `GET /api/v1/search/trending`의 `skills`로 바꿀 수 있음(BE 이미 있음).

### 03-채용공고 › 채용공고 · 지역 필터
크기: S
- [상태] "전체" 칩 켜짐 — 위와 같음
- [네이티브] JS 시트
- [OK] 왼쪽 시·도(서울/경기/인천/부산/대전/원격), 오른쪽 "서울 전체 842" + 구별 개수·체크, "서울 강남구 외 2", "공고 398개 보기" (`features/jobs/components/filter-regions.tsx`, `features/jobs/utils/filters.ts:42`)

### 03-채용공고 › 채용공고 · 고용형태 필터
크기: S
- [상태] "전체" 칩 켜짐 — 위와 같음
- [네이티브] JS 시트
- [OK] 정규직/계약직/인턴/프리랜서/파견 (`packages/api-client/src/labels/catalogs.ts:31-37`), 칩 "정규직", "공고 1,021개 보기"

### 03-채용공고 › 채용공고 · 빈 상태
크기: S
- [문구] 칩: 디자인 "직군 · 개발", "경력 · 4–6년", "지역 · 제주" vs 앱 "개발", "4–6년", "제주" (`packages/api-client/src/labels/chip-label.ts:1-2`). 다른 필터 아트보드("개발 외 1", "정규직")와 디자인끼리 형식이 다름 → 디자인 확정 필요.
- [상태] 빈 상태 문구 스타일: 디자인 b1 w7. 앱 b2 t3 (`features/jobs/components/posting-grid.tsx:49-53` → StatusNote).
- [OK] "조건에 맞는 공고가 없어요.\n필터를 줄여 보세요." + "필터 초기화" (`features/jobs/constants.ts:5-6`), "공고 0개"

### 03-채용공고 › 채용공고 · 로딩
크기: M
- [상태] 디자인: 칩은 보이고, 개수·정렬 줄 없이 2열 카드 스켈레톤. 앱: 개수 자리에 "불러오는 중" 글자 + "최신순" 표시(`screens/jobs/job-list-screen.tsx:38`), 목록은 ActivityIndicator (`features/jobs/components/posting-grid.tsx:40-41`).

---

## 04-공고-상세
앱 화면: `screens/jobs/posting-detail-screen.tsx` (상단 바·하단 CTA·지원 시트·토스트는 네이티브 RN) + 본문은 WebView `fo-web/src/pages/posting/posting-page.tsx`, `fit-card.tsx`.

### 04-공고-상세 › 채용공고 상세
크기: M
- [문구] 보조 CTA: 디자인 "에이전트로 맞추기" vs 앱 "AI로 맞추기" (`screens/jobs/posting-detail-screen.tsx:56`)
- [상태] 마감 배지: 디자인 "D-13" 회색(`badge grey`). fo-web은 빨강 (`apps/fo-web/src/pages/posting/posting-page.tsx:45` `badge red`).
- [상태] FREE: 디자인은 5개 항목 점수·약점을 **흐리게(blur 5px, opacity .55) 보여 주고** 그 위에 알약 "🔒 PRO로 올리면 항목별 점수와 약점을 볼 수 있어요". 부제 없음. fo-web은 점수 자리 "–", 같은 문구를 h3 부제로 보여 줌 (`apps/fo-web/src/pages/posting/fit-card.tsx:36-44,69-81`, `fit-view.ts:41-50`).
- [상태] PRO·ULTRA: "조금만 고치면 8점대예요"는 `fit.reachable`이 있을 때만 나오는데, 실제 API 경로(`fitCardModel`)는 `reachable`을 안 채움 → mock에서만 보임 (`apps/fo-web/src/pages/posting/fit-view.ts:40-52`, `fit-card.tsx:38-39`).
- [BE] 적합도 결과(`POST /api/v1/postings/{id}/fit` → `GET /api/v1/ai/jobs/{jobId}` result)에 도달 가능 점수 `reachable` 필드 없음. 현재 결과는 `fitScore, parts, topGap, plan`만 (`fit-view.ts:16-21`).
- [상태] 상단 바: 이 아트보드는 뒤로만 있음. 앱은 북마크+공유 캡슐 (`screens/jobs/posting-detail-screen.tsx:29-39`). 같은 페이지 다른 아트보드(계산 중/서류 고르기/지원 완료/상태/큰 글씨)는 북마크+공유가 있어 디자인끼리 다름 → 앱 쪽(있음) 유지가 맞아 보임.
- [상태] 적합도 항목 수: 이 아트보드 5개(기술 스택/경험 연관성/경력 수준/키워드/도메인), 나머지 아트보드 3개(기술 스택/경험 연관성/키워드). fo-web 5개 (`fit-view.ts:3-9`) → 디자인 확정 필요.
- [OK] 회사 로고·이름·업종, 제목, 배지(지역/경력 4–6년/정규직), 적합도 링(64px), "내 적합도 · {서류}", 약점 "!" 줄, 섹션 하는 일/자격 요건/우대 사항/근무 조건, "원문 보기 · {회사} 채용 사이트" (`posting-page.tsx:31-73`), 적합도 카드 누르면 에이전트로 이동 (`fit-card.tsx:50`)

### 04-공고-상세 › 채용공고 상세 · 적합도 계산 중
크기: M
- [상태] 실제 API에서 계산 중이면 "공고와 서류를 비교하는 중…"(shimmer)이 아니라 "적합도는 곧 볼 수 있어요"가 나옴: `comparing = mock && isPending`이라 mock에서만 계산 중 상태가 뜸 (`apps/fo-web/src/pages/posting/fit-card.tsx:34-44`).
- [OK] 링 자리 glyph, 점수 "–" (`fit-card.tsx:62,78`), 문구 상수 (`fit-view.ts:14`), 상단 북마크·공유

### 04-공고-상세 › 채용공고 상세 · 지원 서류 고르기
크기: M
- [문구] 서류 출처: 디자인 "에이전트로 맞춘 서류 · 오늘" vs 앱 "AI로 맞춘 서류 · 오늘" (`features/jobs/constants.ts:33`)
- [상태] "함께 보낼 수 있어요": 디자인은 포트폴리오 행의 보조 문구("함께 보낼 수 있어요 · 8월 3일"). 앱은 목록 아래 따로 떨어진 한 줄로 항상 보임 (`features/jobs/components/apply-sheet.tsx:38-40`), 행 문구는 AI/원본 두 가지뿐 (`features/jobs/utils/apply-doc.ts:15-21`).
- [BE] `GET /api/v1/sources`(`DocumentsLibraryItem`)에 서류 종류(이력서/포트폴리오 등) 필드가 없음 — `id, fileName, mimeType, size, pageCount, createdAt, origin`만. 행마다 "함께 보낼 수 있어요"를 붙이려면 `kind` 필요.
- [네이티브] 지원 시트 = JS 시트 (공통 사항)
- [OK] "어떤 서류로 지원할까요?", "{회사} · {제목}", 라디오 22px, "지원하면 마이 › 내 활동 › 지원활동에 기록돼요.", "이 서류로 지원하기" (`features/jobs/components/apply-sheet.tsx:25-43`, `features/jobs/components/doc-row.tsx`)

### 04-공고-상세 › 채용공고 상세 · 지원 완료
크기: S
- [문구] "에이전트로 맞추기" vs "AI로 맞추기" (`screens/jobs/posting-detail-screen.tsx:56`)
- [OK] CTA "지원 완료"(비활성) (`screens/jobs/posting-detail-screen.tsx:61`), 토스트 "지원했어요. 내 활동에서 진행 상황을 볼 수 있어요" + 초록 체크 (`screens/jobs/posting-detail-screen.tsx:63`, `features/jobs/components/posting-toast.tsx`)

### 04-공고-상세 › 채용공고 상세 · 상태
크기: S
- [문구] "에이전트로 맞추기" vs "AI로 맞추기" (`screens/jobs/posting-detail-screen.tsx:56`)
- [OK] 적합도 대기 "적합도는 곧 볼 수 있어요" (`apps/fo-web/src/pages/posting/fit-view.ts:13`), 지원하는 중 "지원하는 중…"(비활성) (`features/jobs/components/apply-sheet.tsx:28-30`), 지원 실패 "지원하지 못했어요. 잠시 후 다시 눌러 주세요." (`features/jobs/components/apply-sheet.tsx:42`)

### 04-공고-상세 › 채용공고 상세 · 큰 글씨
크기: M
- [상태] 본문이 WebView라 시스템 글자 크기를 따르지 않음: fo-web은 `-webkit-text-size-adjust:100%`만 있고(`apps/fo-web/src/styles.css:6`) iOS Dynamic Type(`-apple-system-body` 등)·Android `textZoom` 연동이 없음 (`shared/components/detail-web-view.tsx`에도 없음). 하단 CTA(네이티브)만 커짐.
- [문구] "에이전트로 맞추기" vs "AI로 맞추기"

---

## 11-Hub

### 11-Hub › 허브
크기: S
- [문구] 상단 바: 디자인 "내 프로필"(`btn sec2 sm` 버튼) vs 앱 "내 프로필 보기"(acText 글자 링크) (`screens/hub/hub-screen.tsx:77-81`)
- [OK] "허브" 큰 제목, 필터 버튼 + 배지 "필터 2개 적용됨" (`features/hub/components/filter-button.tsx`), 검색 "이름, 직무, 기술 검색"(누르면 검색 사람 탭), 직군 칩(개발/디자인/기획/마케팅/데이터/영업), "추천 프로필" + 요약 배지 "3–5년 · 이직/구직중" (`features/hub/utils/filters.ts:11-14`), 행(아바타·이름·상태 배지·헤드라인·"개발 · 5년차"·꺾쇠) (`features/hub/components/profile-row.tsx`)

### 11-Hub › 허브 · 필터
크기: M
- [상태] "탐색": 디자인은 칩 3개 "추천 / 제안 / 보낸 제안 3". 앱은 칩 2개 "추천 / 제안" + 옆에 고를 수 없는 글자 "보낸 제안 {n}" (`features/hub/components/hub-filter-sheet.tsx:54-62`).
- [BE] 계약상 `GET /api/v1/profiles?explore=`는 `recommended | offers`(offers = 내가 제안 보낸 프로필)만 있음 (`push-be/packages/contracts/spec/social.ts:50`). 디자인처럼 "제안"과 "보낸 제안"을 따로 고르려면 받은 제안용 값이 더 필요. 디자인 의도(“제안” = 받은 제안?) 확인 필요.
- [네이티브] JS 시트
- [OK] "필터" + "초기화", 재직 기간 0–2년/3–5년/6–9년/10년+, 커리어 상태 만족/이직/구직중/프로필 피드백, "프로필 46개 보기" (`features/hub/components/hub-filter-sheet.tsx:32-53`)

### 11-Hub › 허브 프로필 상세
크기: M
- [없음] 숫자 줄 "42 팔로잉 · 128 팔로워 · 15 게시글". fo-web WebView 프로필엔 없음 (`apps/fo-web/src/pages/profile/profile-page.tsx:32-55`). 계약 `ProfileDetail`엔 `followingCount`, `postCount`가 이미 있음(앱 타입 `packages/api-client/src/types.ts:66-68`) → FE만 고치면 됨.
- [OK] 상단 캡슐 "팔로우 / 공유 / 제안하기" (`screens/hub/profile-detail-screen.tsx:33-51`), 아바타·이름·헤드라인·배지("개발 · 4년차", "이직/구직중"), 소개/경력(타임라인, "2023년 3월 – 현재")/기술 스택 (`profile-page.tsx:56-93`)

### 11-Hub › 제안하기 시트
크기: M
- [상태] 시트 머리: 디자인은 iOS에서만 왼쪽 닫기 버튼 + 제목 "제안하기"(Android는 닫기 없음). 앱은 모든 플랫폼에서 제목 오른쪽 36px 닫기 (`shared/components/bottom-sheet.tsx:28-47`, `features/hub/components/proposal-sheet.tsx:34`).
- [상태] "함께 보낼 공고 (선택)": 디자인 b2 w7, 칩이 줄바꿈되고 칩마다 회사 로고 사각형. 앱 c1 t3 w7, 가로 스크롤, 로고 없음 (`features/hub/components/proposal-sheet.tsx:62-75`).
- [상태] 배경 프로필에 숫자 줄(팔로잉/팔로워/게시글)이 없음 — "허브 프로필 상세" 아트보드와 디자인끼리 다름.
- [네이티브] JS 시트
- [OK] "이하은 님에게" + "개발 · 4년차 · 이직/구직중", "메시지" 필드 + "83 / 500" (`shared/components/text-field.tsx:29-31`, `features/hub/constants.ts:8`), "제안은 이하은 님의 알림과 메시지함으로 전달돼요.", "제안 보내기"

### 11-Hub › 허브 프로필 상세 · 내 프로필
크기: M
- [상태] 내 프로필 버튼: 디자인 2개 "기본 정보 편집", "PDF로 내보내기"(아이콘 포함). fo-web은 4개 "기본 정보 편집/소개 편집/경력 편집/기술 스택 편집", PDF 없음 (`apps/fo-web/src/pages/profile/profile-page.tsx:13-18,46-54`).
- [BE] 프로필 PDF 내보내기 엔드포인트 없음(계약엔 `/api/v1/documents/{id}/exports`만). `HUB_PROFILE` 문서 내보내기로 대신할지 확인 필요.
- [없음] 숫자 줄 "18 팔로잉 · 12 팔로워 · 8 게시글" — 위와 같음
- [OK] 상단 캡슐 "공유"만(팔로우·제안하기 숨김) (`screens/hub/profile-detail-screen.tsx:35,49`)

### 11-Hub › 허브 · 빈 상태
크기: S
- [상태] 문구 스타일: 디자인 b1 w7. 앱 b2 t3 (`screens/hub/hub-screen.tsx:100-105`).
- [문구] 상단 "내 프로필" vs "내 프로필 보기" (`screens/hub/hub-screen.tsx:79`)
- [OK] "조건에 맞는 프로필이 없어요." + "필터 초기화"

### 11-Hub › 허브 · 로딩
크기: M
- [상태] 디자인 행 스켈레톤 5개. 앱 `LoadingNote` (`screens/hub/hub-screen.tsx:93-94`).
- [OK] 로딩 중 "내 프로필" 버튼 숨김 — 앱도 `viewerId`가 없으면 숨김 (`screens/hub/hub-screen.tsx:76`)

---

## 12-Social

### 12-Social › 소셜
크기: —
- [OK] "소셜" 큰 제목 + 검색 + 글쓰기 (`screens/social/social-screen.tsx:17-37`), 칩 전체/직장 생활/개발/일상/커리어/소통/커피챗/마케팅·광고 (`packages/api-client/src/labels/catalogs.ts:52-61`), 카드(아바타·이름·"커리어 · 2시간 전"·제목 h3·본문 2줄·사진 1~3장·말풍선 "댓글 24"), 카드 사이 띠 (`features/social/components/post-card.tsx`)

### 12-Social › 게시물 상세
크기: M
- [없음] 상단 바 오른쪽 "더 보기"(…) 버튼. 앱은 뒤로만 (`screens/social/post-detail-screen.tsx:18`).
- [네이티브] "더 보기"는 iOS pull-down 메뉴 / Android 드롭다운 메뉴 후보(메뉴 내용은 디자인에 없음).
- [OK] "일상 · 4시간 전 · 조회 238" (`features/social/utils/post-info.ts:10-13`), 제목 h1·본문 b1 t2·사진, "댓글 12", 댓글(이름 굵게 + 시간, "답글 달기") (`features/social/components/comment-row.tsx`), 입력창 "댓글을 남겨 주세요" + 비활성 보내기 (`features/social/components/comment-composer.tsx:39,43-53`)

### 12-Social › 글쓰기 시트
크기: M
- [없음] "제목" 라벨 + 오른쪽 "1–100자", 제목 아래 1px 밑줄, "본문" 라벨. 앱은 라벨 없이 입력창만 (`screens/social/compose-screen.tsx:61-79`).
- [네이티브] 카테고리 "커리어 ⌄": 앱은 눌러서 JS 시트 "어떤 이야기인가요?" (`screens/social/compose-screen.tsx:110-124`). 디자인엔 고르는 화면이 없고 꺾쇠만 있음 — iOS pull-down 메뉴 후보.
- [네이티브] 화면 자체: 디자인 iOS는 뒤 화면이 비치는 카드형 시트(top 62px, 38 radius). 앱은 `presentation: 'modal'`(`app/(tabs)/(social)/_layout.tsx:9`) → iOS 네이티브 page sheet라 일치. Android는 디자인도 시트 모양인데 앱 modal은 전체 화면.
- [OK] 닫기 / "새 글" / "게시", "카테고리" 행, placeholder "제목을 입력해 주세요"/"나누고 싶은 이야기를 적어 주세요", 사진 칸 + "2/4" (`screens/social/compose-screen.tsx:37-108`)

### 12-Social › 소셜 · 상태
크기: S
- [상태] 빈 상태 "글쓰기" 버튼: 디자인 `btn sec2 sm`(보조). 앱 primary (`screens/social/social-screen.tsx:75`).
- [상태] 문구 스타일: 디자인 b1 w7. 앱 b2 t3 (`screens/social/social-screen.tsx:65-67,72-74`).
- [OK] "아직 올라온 글이 없어요" / "글을 불러오지 못했어요" + "다시 불러오기" (`screens/social/social-screen.tsx:63-77`)

### 12-Social › 소셜 · 로딩
크기: M
- [상태] 디자인 카드 스켈레톤 3개(띠 포함). 앱 `LoadingNote` (`screens/social/social-screen.tsx:61-62`).

---

## 요약

| 항목 | 값 |
|---|---|
| 아트보드 | 44 (Auth 8 · Home 10 · 채용공고 8 · 공고 상세 6 · Hub 7 · Social 5) |
| OK (차이 없음, 크기 —) | 7 |
| S | 17 |
| M | 20 |
| L | 0 |

| 페이지 | 아트보드 | OK | S | M | L |
|---|---|---|---|---|---|
| 01-Auth | 8 | 1 | 2 | 5 | 0 |
| 02-Home | 10 | 4 | 4 | 2 | 0 |
| 03-채용공고 | 8 | 1 | 6 | 1 | 0 |
| 04-공고-상세 | 6 | 0 | 2 | 4 | 0 |
| 11-Hub | 7 | 0 | 2 | 5 | 0 |
| 12-Social | 5 | 1 | 1 | 3 | 0 |
| 합계 | 44 | 7 | 17 | 20 | 0 |

크기별 목록
- OK (7): 이미 가입된 번호, 홈 스크롤 전, 홈 스크롤 후, 마감 임박 공고 전체보기, 홈 큰 글씨, 채용공고 전체 목록, 소셜
- S (17): 휴대폰 번호 입력·휴대폰 번호로 시작하기, 인증번호 5번 초과, 알림함, 검색 최근 검색어, 검색 결과, 알림함 상태, 경력 필터, 직군 필터, 기술 스택 필터, 지역 필터, 고용형태 필터, 채용공고 빈 상태, 상세 지원 완료, 상세 상태, 허브, 허브 빈 상태, 소셜 상태
- M (20): 로그인, 휴대폰 번호 입력·소셜 후, 휴대폰 번호 인증, 약관 동의, 로그인 오류, 홈·검색·상태, 홈·검색·알림·로딩, 채용공고 로딩, 채용공고 상세, 적합도 계산 중, 지원 서류 고르기, 상세 큰 글씨, 허브 필터, 허브 프로필 상세, 제안하기 시트, 허브 내 프로필, 허브 로딩, 게시물 상세, 글쓰기 시트, 소셜 로딩

디자인끼리 엇갈려 확정이 필요한 것
- 필터 칩 형식: "경력 4–6년" / "정규직" / "직군 · 개발" 세 가지가 섞임 (채용공고)
- 필터를 걸어도 "전체" 칩이 켜진 아트보드와 꺼진 아트보드가 섞임 (채용공고)
- 공고 상세 상단 북마크·공유: 첫 아트보드만 없음. 적합도 항목 수: 첫 아트보드 5개, 나머지 3개
- 프로필 숫자 줄(팔로잉/팔로워/게시글): 프로필 상세엔 있고 제안하기 시트 배경엔 없음

[BE] 항목
1. 적합도 결과에 `reachable`(조금만 고치면 N점대) 필드 — `POST /api/v1/postings/{id}/fit` → `GET /api/v1/ai/jobs/{jobId}` result (공고 상세)
2. `GET /api/v1/sources`(`DocumentsLibraryItem`)에 서류 종류 `kind` — 지원 시트의 "함께 보낼 수 있어요" 행 표시 (지원 서류 고르기)
3. `GET /api/v1/profiles?explore=`에 받은 제안용 값 — 디자인 "제안 / 보낸 제안" 분리 시 (허브 필터, 디자인 의도 확인 먼저)
4. 프로필 PDF 내보내기 엔드포인트 — "PDF로 내보내기" (내 프로필; `documents/{id}/exports` 재사용 가능 여부 확인)
- 참고(BE는 이미 있음, FE만 연결): `GET /api/v1/search/trending`(인기 검색어·인기 기술), `ProfileDetail.followingCount/postCount`(프로필 숫자 줄)

[네이티브] 항목
1. 필터/지원/제안/카테고리 시트 전부: 앱은 RN `Modal` + Glass JS 시트 (`shared/components/bottom-sheet.tsx`) → 네이티브 시트(detent·드래그 닫기) 후보
2. 정렬 "최신순 ⌄"/"관련도순 ⌄": 앱은 눌러지지 않는 글자 → 네이티브 메뉴 후보(디자인에 메뉴 화면 없음)
3. 게시물 상세 "더 보기": 앱에 없음 → 네이티브 메뉴 후보
4. 글쓰기 카테고리 "⌄": 앱은 JS 시트 → pull-down 메뉴 후보; 글쓰기 화면은 iOS page sheet(일치), Android는 전체 화면(디자인은 시트)
5. 이미 네이티브(일치): 탭 바 `NativeTabs` + 스크롤 시 최소화, 유리 버튼 expo-glass-effect, 설정 스위치는 이 범위에 없음
