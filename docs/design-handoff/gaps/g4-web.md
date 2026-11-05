# G4 · fo-web 개인 화면 vs 최신 디자인 (2026-11-05) — 짧은 갭 목록

- 기준: Claude Design 앱 export(`../push-app`), 갭 문서 `g1-*.md`·`g3-*.md`, push-fe develop `a2aa882` + `origin/feat/design-system`(#144) 머지본
- 범위: `apps/fo-web` 개인 화면만. 에이전트 채팅은 웹에 넣지 않음. 기업 화면은 토큰·문구만.
- 상태: **분석만 끝남. 코드는 고치지 않음**(작업이 Cursor 클라우드 에이전트로 넘어감, 브랜치 `feat/web-design`).
- 주의: 열린 PR #139(`feat/main-tabs-design`)가 fo-web 파일을 이미 고침 → 아래 "#139에서 처리"는 다시 하지 말 것. #139가 바꾼 파일: `pages/posting/{constants.ts,fit-card.tsx,fit-view.ts,fit-view.test.ts,posting-page.tsx}`, `pages/profile/{profile-page.tsx,profile-stats.ts}`, `shared/api/mock.ts`, `styles.css`(42–90행 근처). #140도 `shared/api/mock.ts`(제안 recipient)를 고침. 충돌을 피하려면 이 파일은 #139·#140이 머지된 뒤 손대거나 `git merge origin/<branch>`로 받아서 작업.

## #139에서 이미 처리 (fo-web, WebView 본문)
- 공고 상세 적합도 카드: 실서버에서 "공고와 서류를 비교하는 중…" 상태, FREE 흐림 + 잠금 알약, `reachable` → "조금만 고치면 N점대예요"(PRO·ULTRA, 점수대가 오를 때만), 꺾쇠, D-day 회색 배지
- 큰 글씨: posting·profile WebView가 시스템 글자 크기를 따름
- 허브 프로필 상세: "42 팔로잉 · 128 팔로워 · 15 게시글" 숫자 줄
- BE 확인: push-be develop `posting_fit.py`가 `reachable`을 이미 돌려줌 → [BE] 아님

## 남은 갭 (크기 · 값 높은 순)

### 1. 문구 "AI" → "에이전트" (S)
- `pages/posting/constants.ts:12` "AI로 맞춘 서류" → "에이전트로 맞춘 서류" (#139 파일, #139 뒤에)
- `pages/settings/constants.ts:20` "AI 작업 완료" → "에이전트 작업 완료"
- `pages/settings/constants.ts:25` "화면과 AI 답변 언어가 함께 바뀌어요" → 디자인 "앱 화면과 에이전트 답변 언어가 함께 바뀌어요."
- `pages/notifications/constants.ts:1` "AI 작업 완료 알림은 앱에서 받아요" → "에이전트 작업 완료 알림은 앱에서 받아요"
- `shared/api/mock.ts:687` 알림 mock "AI 작업이 끝났어요" (#139·#140 파일)
- 그대로 둘 것: `CONSENT_COPY`("다른 사용자와 기업의 AI가…"), `TERMS_DETAIL`("해외 AI 제공사") — 제3자 AI를 뜻하는 법적 고지

### 2. 공고 상세 · 지원 서류 고르기 (M) — `pages/posting/apply-sheet.tsx`
- 디자인: 제목 "어떤 서류로 지원할까요?" + "{회사} · {제목}", 라디오 22px, 행 보조 문구 "에이전트로 맞춘 서류 · 오늘" / 원본, 안내 "지원하면 마이 › 내 활동 › 지원활동에 기록돼요.", 버튼 "이 서류로 지원하기", 하는 중 "지원하는 중…", 실패 "지원하지 못했어요. 잠시 후 다시 눌러 주세요.", 그랩만 있는 시트(X 없음)
- fo-web: 체크박스 다중 선택, X 닫기, "함께 보낼 수 있어요"가 목록 아래 항상 보임(`apply-sheet.tsx:60`), "서류 {n}개로 지원하기", 하는 중·실패 문구 없음, 회사·제목 줄 없음
- 파일 배지 없음은 이미 맞음. "함께 보낼 수 있어요"는 서류 종류 `kind`가 없어 행에 못 붙임 → [BE] `GET /api/v1/sources`에 `kind`(g1 [BE] 2)

### 3. 로딩 = 스켈레톤 (M)
- 디자인은 전부 스켈레톤(+ sr-only "불러오는 중"). fo-web은 `shared/ui/status.tsx` 글자 상태
- 대상: 홈 섹션 카드, 채용공고 2열 그리드(개수·정렬 줄 숨김), 허브 행 5개, 소셜 카드 3개, 검색 결과 행, 알림 행, 마이 서류·내 활동 목록
- 공용 `shared/ui/skeleton.tsx` 하나 + 화면별 모양. CSS는 #139가 고친 42–90행을 피해 파일 끝에 추가

### 4. 빈·오류 상태 (S–M)
- 문구 스타일 b1 w7 한 덩어리(디자인) vs 글자 상태(fo-web). 빈 상태 버튼은 보조(sec2) 버튼
- 알림 빈 상태: 64px 종 아이콘 타일 + "아직 받은 알림이 없어요."
- 마이 내 활동 빈 상태 마침표: "아직 지원한 공고가 없어요." / "북마크한 공고가 없어요." / "아직 팔로우한 사람이 없어요." / "아직 쓴 글이 없어요." (fo-web `pages/my/constants.ts` 확인 필요 — 아직 안 봄)
- 소셜: "아직 올라온 글이 없어요" / "글을 불러오지 못했어요" + "다시 불러오기"
- 채용공고: "조건에 맞는 공고가 없어요.\n필터를 줄여 보세요." + "필터 초기화"
- 허브: "조건에 맞는 프로필이 없어요." + "필터 초기화"

### 5. 필터·검색 (S)
- 채용공고 필터 시트 문구: "여러 개 고를 수 있어요", "공고 {n}개 보기", 칩 "개발 외 1"/"Kotlin 외 2"/"서울 강남구 외 2" — `pages/jobs/filter-sheet.tsx` 대조 필요(아직 안 봄)
- 칩 형식("경력 4–6년" vs "4–6년" vs "직군 · 개발")은 디자인끼리 엇갈림 → 확정 전 그대로
- 검색: 사람 결과 단위 "명"("‘백엔드’ 사람 8명"), 공고 결과는 제목만 강조, "관련도순"은 공고 탭에만, 인기 검색어는 `GET /api/v1/search/trending`(#139가 api-client에 `searchTrending()` 추가)
- 허브 탐색: "추천 / 제안 / 보낸 제안 3" 3칩 → [BE] `explore=` 받은 제안 값(g1 [BE] 3)

### 6. 허브·소셜·마이 (M)
- 허브 상단 "내 프로필" 보조 작은 버튼(웹에 해당 링크가 있으면)
- 허브 내 프로필: 디자인은 "기본 정보 편집" + "PDF로 내보내기" 2개. fo-web은 편집 4개(`profile-page.tsx:13-18`, #139 파일). PDF는 [BE] 엔드포인트 없음(g1 [BE] 4)
- 소셜 글쓰기: "제목" 라벨 + "1–100자", 밑줄, "본문" 라벨 — `pages/social/composer-sheet.tsx` 대조 필요
- 마이 서류 빈 상태: "PDF나 DOCX 파일을 올리거나\n에이전트로 새로 만들어 보세요." — 웹은 에이전트가 없으므로 "에이전트로 만들기" 버튼은 앱 열기로 보낼지, 문장을 줄일지 결정 필요
- 마이 내 활동: "팔로잉" / "내가 쓴 글" 섹션 제목 + "18명 전체 보기 ›" / "8개 전체 보기 ›", 미리보기 5명·4개
- 제안함: 받은 제안 회사 줄 "회사 · 헤드라인", 보낸 제안 행 사진·회사 → [BE] `Offer.recipient` 필드(#140이 타입·mock 반영 중)
- 설정: "대화 기록 보관" 행이 있으면 삭제(2026-10-29 결정), 로그인 방식에 Apple·전화 라벨

### 7. 기업 화면 (S)
- 토큰은 #144로 이미 받음. 문구만: `pages/posting/constants.ts:8` "기업 AI 채팅이 열리고 이 공고가 첨부돼요" 등 기업 쪽 "AI" 표기는 기업 용어 결정 전이라 보류

## [BE]
1. `GET /api/v1/sources`에 서류 종류 `kind` — 지원 시트 "함께 보낼 수 있어요" 행
2. `GET /api/v1/profiles?explore=` 받은 제안 값 — 허브 탐색 3칩
3. 프로필 PDF 내보내기 — 허브 내 프로필
4. `Offer.recipient`의 `avatarUrl·companyName·headline` — 보낸 제안 행
