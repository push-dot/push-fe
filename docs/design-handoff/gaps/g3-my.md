# G3 · 마이 (13 프로필 · 14 서류 · 15 내 활동 · 16 제안함 · 17 설정) — 디자인 vs 앱 갭

- 디자인: `docs/design-handoff/push-app/13~17-*.html` (번들을 풀어 artboard DOM 텍스트로 비교, 44개)
- 앱: `push-fe` develop `fc4c872`, 경로는 모두 `apps/fo-mobile/` 기준
- BE 확인: `push-be` develop `packages/contracts/openapi.json`
- 전역 메모
  - 앱 `src/` 어디에도 `@expo/ui`가 없음. 세그먼트·메뉴·피커·시트는 전부 JS 커스텀 (`src/shared/components/segmented-control.tsx`, `bottom-sheet.tsx`). 탭 바만 `NativeTabs` 네이티브 (`src/app/(tabs)/_layout.tsx:6`).
  - 공통 `BottomSheet`는 제목이 있으면 X 닫기 버튼을 그림 (`src/shared/components/bottom-sheet.tsx:39-46`). 디자인 `sheet2`는 그랩만 있고 X 없음 → 시트가 나오는 모든 artboard에서 [추가].
  - "AI" → "에이전트" 이름 바꾸기(2026-10 결정)가 마이 영역에 아직 덜 됨. 아래에 [문구]로 하나씩 적음.

---

## 13 · 마이 › 프로필

### 마이-프로필 › 마이 · 프로필 — S · OK
- [OK] 상단 "마이" + 제안함(배지 "받은 제안 2개")·설정 버튼 (`src/features/my/components/my-header.tsx:8-31`), 세그먼트 프로필/서류/내 활동 (`src/screens/my/my-screen.tsx:9-13`), 아바타·이름·헤드라인·배지 "개발 · 4년차"/"이직/구직중", 소개·경력 타임라인·기술 스택 섹션과 편집 아이콘, "기본 정보 편집"·"공유" 버튼 (`src/features/my/components/profile-tab.tsx:57-162`)
- [상태] 통계 표기: 디자인은 숫자만 굵게("**18** 팔로잉", b2), 앱은 라벨 전체가 c1 700 (`profile-tab.tsx:84-86`)
- [네이티브] 세그먼트: 디자인 iOS는 글래스 세그먼트, 앱은 JS `SegmentedControl` (`src/shared/components/segmented-control.tsx:16`). 탭 바는 `NativeTabs`로 네이티브 ✓

### 마이-프로필 › 프로필 편집 · 기본 정보 — S
- [OK] 닫기·"기본 정보"·"저장" 헤더 (`src/features/my/components/sheet-header.tsx:30-50`), 사진 안내 "사진은 허브 프로필과\n이력서 템플릿에 함께 쓰여요." (`src/screens/my/edit-profile-screen.tsx:260`), 이름·헤드라인 "20/40" (`:278`), 직군·연차, 커리어 상태 세그먼트 만족/이직/구직중/프로필 피드백, "제안 받기" + "허브에서 다른 사람이 제안을 보낼 수 있어요" (`:311-316`)
- [네이티브] 편집 화면은 `presentation: 'modal'`(네이티브 시트) ✓ (`src/app/(tabs)/(my)/_layout.tsx:8`). 직군·연차 선택은 커스텀 `BottomSheet` 목록("어떤 직군인가요?"/"몇 년차인가요?", `edit-profile-screen.tsx:319-334`). 디자인에 선택 UI가 그려져 있지 않으니 네이티브 메뉴(iOS Menu / Android 드롭다운)로 바꿀지 정해야 함

### 마이-프로필 › 프로필 편집 · 소개 — S
- [문구] 디자인 "에이전트로 다듬기" vs 앱 "AI로 다듬기" (`src/screens/my/edit-profile-screen.tsx:364`)
- [OK] 글자 수 "118 / 500" (`src/shared/components/text-field.tsx:29-31`), 안내 "허브 프로필 맨 위에 보여요. 3~4문장이면 충분해요." (`edit-profile-screen.tsx:370`)
- [상태] 버튼을 누르면 맥락 없이 에이전트 첫 화면으로만 감 (`edit-profile-screen.tsx:362-367`, shortcut 주석)

### 마이-프로필 › 프로필 편집 · 경력 — L
- [OK] 펼친 경력 카드(회사·직무·시작·재직 중 스위치·설명·"이 경력 삭제하기"), "경력 추가" (`edit-profile-screen.tsx:438-576`)
- [상태] 순서 바꾸기: 디자인은 "끌어서 순서 바꾸기" 드래그 핸들, 앱은 누르면 한 칸 위로 가는 버튼 "위로 옮기기" (`edit-profile-screen.tsx:415-452`, shortcut)
- [네이티브] 시작 날짜: 디자인은 "2022년 3월"이라고 적힌 선택 필드(월 피커), 앱은 텍스트 입력 "시작 (2022.03)"과 숫자 키패드 (`edit-profile-screen.tsx:485-491`). iOS `DatePicker`(compact) / Android Material 날짜 피커로 바꿔야 함

### 마이-프로필 › 프로필 편집 · 경력 · 상태 — S
- 재직 중 끔 · 종료일: [OK] 스위치를 끄면 "종료 (2024.02)" 필드가 나타남 (`edit-profile-screen.tsx:514-522`). [네이티브] 종료일도 텍스트 입력이라 위와 같은 월 피커 교체 필요
- 빈 칸 오류: [상태] 디자인은 기간 줄("2022년 3월 – 현재")을 그대로 두고 필드 아래·삭제 버튼 위에 "회사, 직무, 기간을 채워 주세요"를 띄움. 앱은 기간 줄 자리를 이 오류 문구로 바꿈 (`edit-profile-screen.tsx:472-474`). 문구는 같음

### 마이-프로필 › 프로필 편집 · 경력 · 삭제 확인 — M
- 경력 삭제 확인: [문구] 본문이 디자인 "모아페이 · 백엔드 엔지니어 경력을 프로필에서 지워요." vs 앱 "이 경력을 프로필에서 지워요." (`src/features/my/utils/my-rules.ts:36`). 제목 "이 경력을 삭제할까요?"와 취소/삭제는 같음
- [네이티브] 디자인은 그랩이 있는 하단 확인 시트(`sheet2 role=alertdialog`), 앱은 시스템 `Alert.alert` (`edit-profile-screen.tsx:533`)
- 삭제 후 되돌리기: [OK] 토스트 "경력을 삭제했어요" + "되돌리기" (`my-rules.ts:38-39`, `edit-profile-screen.tsx:541-549`)

### 마이-프로필 › 프로필 편집 · 기술 스택 — S · OK
- [OK] "기술 검색", 검색어 강조 제안 목록, "내 기술 6개", 선택 칩 + x, "길게 누르면 앞으로 옮겨요. 앞의 5개가 허브 목록에 보여요." (`edit-profile-screen.tsx:615-698`, `my-rules.ts:13`)

---

## 14 · 마이 › 서류

### 마이-서류 › 마이 · 서류 — M
- [상태] Push 서류 헤더: 디자인은 제목 오른쪽에 "전체 5개 보기" 링크. 앱은 오른쪽에 "5개"를 두고 목록 아래에 "전체 5개 보기"를 따로 둠 (`src/features/my/components/docs-tab.tsx:233-245`)
- [없음] Push 서류 카드에 서류 이름("서버 개발자 이력서"/"경력기술서")과 날짜("10월 15일")가 없음. 앱 `PushRow`는 회사·직무·점수만 그림 (`docs-tab.tsx:114-138`)
- [상태] 적합도: 디자인은 큰 숫자 "7.6"(`fitn-l`), 앱은 `String(fitScore)` 원문을 c1 t3로 (`src/features/my/utils/my-rules.ts:139`). 점수 단위(10점 만점)도 확인 필요
- [상태] 올린 파일 메타: 디자인은 "640KB · 9월 28일 · **읽는 중**"처럼 상태를 뒤에 붙임. 앱은 메타 줄을 "읽는 중"/"읽지 못했어요" 하나로 바꿔 버림 (`docs-tab.tsx:84-93`)
- [상태] "다시 시도": 디자인은 `btn sec2 sm` 버튼, 앱은 글자 링크 (`docs-tab.tsx:95-101`)
- [OK] "올린 파일 3개", "파일 등록", "PDF, DOCX 파일을 20MB까지 올릴 수 있어요." (`my-rules.ts:45`)

### 마이-서류 › 마이 · 서류 빈 상태 — S
- [문구] 디자인 "PDF나 DOCX 파일을 올리거나\n에이전트로 새로 만들어 보세요." vs 앱 "…\nAI로 새로 만들어 보세요." (`docs-tab.tsx:216`)
- [문구] 디자인 "에이전트로 만들기" vs 앱 "AI로 만들기" (`docs-tab.tsx:220`)
- [OK] "아직 등록한 서류가 없어요", "파일 등록" (`docs-tab.tsx:213,219`)

### 마이-서류 › 마이 · 서류 가져오기 — S
- [문구] 디자인 "에이전트로 새로 만들기" vs 앱 "AI로 새로 만들기" (`docs-tab.tsx:179`)
- [OK] "서류 가져오기", "파일에서 고르기" / "PDF, DOCX · 20MB까지", "대화하면서 이력서를 써요" (`docs-tab.tsx:167-182`)
- [추가] 시트 X 닫기 버튼 (공통 `BottomSheet`)

### 마이-서류 › 마이 · 서류 올리는 중 — S · OK
- [OK] 진행 바, "올리는 중 · 1.1 / 1.8MB", 취소 버튼, 토스트 "이력서 파일을 올렸어요" (`docs-tab.tsx:149,249-283`)

### 마이-서류 › 마이 · 서류 보기 — M
- [문구] 디자인 "에이전트로 고치기" vs 앱 "AI로 고치기" (`src/screens/my/doc-viewer-screen.tsx:196`)
- [문구] 주 버튼이 디자인 "내 프로필로 전환" vs 앱 "지원 서류용 프로필로 만들기" (`doc-viewer-screen.tsx:202`)
- [추가] 미리보기 위 메타 줄 "2.4MB · 2쪽 · 10월 12일 등록" (`doc-viewer-screen.tsx:163-167`). 디자인은 그 자리에 "1 / 2" 배지만 있음
- [OK] 상단 파일 이름 + 공유·더 보기, 종이 미리보기(이름·연락처·소개·경력·프로젝트·기술 스택) (`doc-viewer-screen.tsx:43-116,135-151`)
- [상태] 공유가 파일이 아니라 파일 이름 글자만 보냄 (`doc-viewer-screen.tsx:141`, shortcut)

### 마이-서류 › 마이 · 서류 → 내 프로필로 전환 — M
- [문구] 디자인은 하단 주 버튼이 "지원 서류용 프로필(허브형)"으로 바뀜. 앱은 "지원 서류용 프로필로 만들기" (`doc-viewer-screen.tsx:202`)
- [문구] 시트 설명이 디자인 "고른 항목만 허브 프로필에 반영돼요. 반영한 뒤에도 섹션별로 고칠 수 있어요." vs 앱 "지원 서류용 프로필로 만들어요." (`doc-viewer-screen.tsx:31`). 제목 "이 이력서로 프로필을 채울까요?"는 같음
- [없음] 섹션 체크리스트(기본 정보 "이름 · 헤드라인 · 개발 4년차" / 소개 / 경력 "모아페이, 하루랩스 · 2건" / 기술 스택 "Kotlin, Spring Boot 외 5개"), 경고 "지금 프로필의 소개와 경력은 이 내용으로 바뀌어요.", 버튼 "3개 항목 반영하기". 앱 시트 본문은 빈 `<View />` (`doc-viewer-screen.tsx:38`)
- [상태] 앱은 반영 대신 새 서류를 만들고 `/docs/push/{id}`로 이동 (`doc-viewer-screen.tsx:22-25`)
- [BE] 고른 섹션만 허브 프로필에 반영하는 필드가 없음: `POST /api/v1/documents/{id}/profile` 바디는 `target/applicationId/expectedRevision`뿐(closed), `/base-profile`은 빈 바디. 그리고 앱은 이 엔드포인트에 업로드 **source id**를 넣음 (`src/features/my/api/fetchers.ts:126-127`). 스펙은 HUB_PROFILE **document id**를 받으므로 같이 확인 필요

### 마이-서류 › 마이 · Push 서류 전체 — M
- [상태] 디자인은 X로 닫는 전체 모달(제목 "Push 서류", "5개"). 앱은 뒤로 가기가 있는 스택 화면 (`src/screens/my/push-docs-screen.tsx:34`)
- [없음] 개수 "5개", 행의 "서류 이름 · 날짜" 줄, 적합도 숫자. 앱 행은 회사·직무만 그림 (`push-docs-screen.tsx:13-25`)

### 마이-서류 › 마이 · Push 서류 보기 (페이지) — L
- [상태] 앱 `PushDocView`는 다른 화면: 제목 "지원 서류용 프로필", 회사·직무·지원일·점수·"공고 보기" 버튼, 버전 블록 글자, 혼자 떠 있는 "프로젝트" 제목, "기본 프로필로 설정" 버튼 (`src/features/my/components/push-doc-view.tsx:28-63`)
- [없음] 상단 공고 카드 "서버 개발자 다온뱅크 · 공고 보기 ›" + 적합도 7.6, 프로필 머리(아바타·이름·헤드라인·배지 "개발 · 4년차"/"서버 · 결제"), "기본 정보 편집"과 소개/경력/기술 스택 편집 아이콘 (Push 서류는 모바일에서 편집 가능 — 2026-10-29 결정), 경력 타임라인
- [없음] 하단 "에이전트로 고치기" + "이 공고에 지원", 상단 공유·더 보기

### 마이-서류 › 마이 · Push 서류 보기 (전체 모달 안) — M
- [OK] 서류 탭에서 모달로 열림 (`docs-tab.tsx:301-303`). 뒤로 = 닫기 (`push-doc-view.tsx:30`)
- [상태] 내용 갭은 위 "(페이지)"와 같음. 모달 안 상단 공유·더 보기, 하단 "에이전트로 고치기"/"이 공고에 지원" 없음

### 마이-서류 › 마이 · 서류 · 상태 — M
- 올린 파일 ⋯ 시트: [OK] 제목 파일 이름, "서류 보기", "서류 삭제하기" (`src/features/my/components/doc-menu.tsx:17-35`). [상태] 디자인은 아이콘이 붙은 목록 행, 앱은 secondary 버튼 2개. [추가] X 닫기. [네이티브] iOS 액션 시트/컨텍스트 메뉴 후보인데 지금은 커스텀 `BottomSheet`
- 용량 초과: [상태] 디자인은 토스트 "! 20MB까지 올릴 수 있어요", 앱은 `Alert.alert('20MB까지 올릴 수 있어요', '크기를 줄여서 다시 올려 주세요.')` (`docs-tab.tsx:157`, `my-rules.ts:42-46`)

### 마이-서류 › 마이 · 서류 보기 › 에이전트로 고치기 · 새 대화 — S
- [문구] 진입 버튼: 디자인 "에이전트로 고치기" vs 앱 "AI로 고치기" (`src/screens/my/doc-viewer-screen.tsx:196`)
- [OK] 첫 메시지 "이 서류를 고쳐 줘" (`doc-viewer-screen.tsx:119,199`), 작업 중 입력창 안내 "작업 중에도 말할 수 있어요" (`src/screens/chat/conversation-screen.tsx:93`)
- [상태] 디자인 사용자 말풍선에는 파일 칩 "김서준_백엔드_이력서_2026.pdf"가 있음. 앱은 `attachment` 없이 `evidenceIds`만 넘김 (`doc-viewer-screen.tsx:199`) → 칩이 안 보일 수 있음. 실제 기기에서 확인 필요
- [문구] 도구 카드 진행 문구: 디자인 "서류를 읽는 중" vs 앱 mock "쪽마다 읽는 중" (`src/mock/chat.ts:126`). 실서버 문구는 스트림 이벤트에서 오니 대화 담당 쪽에서 확인 필요

### 마이-서류 › 마이 · 서류 · 삭제 확인 — M
- 서류 삭제 확인: [OK] "이 서류를 삭제할까요?" / "김서준_백엔드_이력서_2026.pdf를 서류에서 지워요. 이 서류로 지원한 기록은 남아요." / 취소·삭제 (`my-rules.ts:25-32`). [네이티브] 디자인은 하단 확인 시트, 앱은 `Alert.alert` (`src/features/my/hooks.ts:35`)
- 삭제 후 되돌리기: [OK] "서류를 삭제했어요" + "되돌리기" (`hooks.ts:43-51`)

### 마이-서류 › 지원 서류용 프로필 — M
- [없음] 프로필 머리(아바타·이름·헤드라인·배지 "개발 · 4년차"/"지원 서류용 프로필(허브형)"), 경력 타임라인, 상단 공유 버튼. 앱은 회사/직무 글자와 버전 블록 글자만 그림 (`push-doc-view.tsx:34-58`)
- [상태] "기본 프로필로 설정": 디자인은 머리 아래 작은 primary 버튼, 앱은 맨 아래 큰 버튼 (`push-doc-view.tsx:59-63`)
- [OK] 상단 제목 "지원 서류용 프로필" (`push-doc-view.tsx:30`)

### 마이-서류 › 지원 서류용 프로필 · 기본 프로필로 설정 확인 — M
- [OK] "이 프로필을 기본 프로필로 설정할까요?" / "허브에 보이는 내 프로필이 이 내용으로 바뀌어요." / 취소·설정 (`my-rules.ts:50-57`)
- [네이티브] 디자인은 하단 확인 시트(primary "설정"), 앱은 `Alert.alert` (`push-doc-view.tsx:22-26`)

### 마이-서류 › 지원 서류용 프로필 · 기본 프로필로 설정함 — S
- [OK] 토스트 "기본 프로필로 설정했어요." (`my-rules.ts:56`)
- [상태] 디자인은 설정한 뒤 "기본 프로필로 설정" 버튼이 사라짐, 앱은 계속 보임 (`push-doc-view.tsx:59-63`)

---

## 15 · 마이 › 내 활동

### 마이-내-활동 › 마이 · 내 활동 — S · OK
- [OK] 칩 지원활동/캘린더/북마크/팔로우/게시글 (`src/features/my/components/activity-tab.tsx:26-32`), "지원한 공고 5개", 로고·직무·"회사 · 날짜"·단계 배지 면접/서류/지원함/합격/불합격 (`activity-tab.tsx:36-69`, `packages/api-client/src/labels/stage-badge.ts:4-16`)

### 마이-내-활동 › 마이 · 내 활동 · 캘린더 — M
- [없음] 범례 줄 "면접 · 마감 · 후속 연락 · 커피챗 · 직접 추가 · Google 캘린더". 앱에 없음 (`src/features/my/components/calendar-view.tsx:105-178`)
- [상태] 일정 보조 줄: 디자인 "Google Meet · 1시간"(장소 먼저), 앱은 `[길이, notes]` 순서 (`calendar-view.tsx:20-24`)
- [BE] `CalendarEvent`에 장소 필드가 없음 (openapi `CalendarEvent`: notes만 있음) → "Google Meet"을 그릴 곳 없음
- [OK] "2026년 10월" + 이전 달/다음 달/일정 추가, 요일 줄, "10월 21일 수요일 · 내일" (`src/features/my/utils/day-title.ts:4-8`), "Google 캘린더" 표시, "마감 · 10월 22일" / "D-2", "오후 3:00" (`calendar-view.tsx:93-103,190-250`)

### 마이-내-활동 › 마이 · 내 활동 · 북마크 — S · OK
- [OK] "북마크한 공고 4개", 로고·회사·직무·"지역 · 경력", 북마크 해제 아이콘 (`activity-tab.tsx:72-129`)

### 마이-내-활동 › 마이 · 내 활동 · 팔로우 — M
- [없음] 섹션 제목 "팔로잉" (오른쪽에 "18명 전체 보기 ›"). 앱은 제목 없이 목록 아래에 "18명 전체 보기"를 둠 (`activity-tab.tsx:196-201`, `my-rules.ts:61`)
- [상태] 미리보기가 디자인은 5명, 앱은 3명 (`activity-tab.tsx:187`)
- [문구] 링크 끝 "›" 없음: "18명 전체 보기" / "팔로워 12명 보기" (`my-rules.ts:61-62`)
- [OK] 행 아바타·이름·헤드라인·"팔로잉" 버튼 (`activity-tab.tsx:131-168`)

### 마이-내-활동 › 마이 · 내 활동 · 게시글 — M
- [없음] 섹션 제목 "내가 쓴 글" (오른쪽에 "8개 전체 보기 ›"). 앱은 제목 없이 목록 아래에 링크 (`activity-tab.tsx:260-265`, `my-rules.ts:63`)
- [상태] 미리보기가 디자인은 4개, 앱은 3개 (`activity-tab.tsx:227`)
- [문구] "댓글 단 글 9개 보기 ›"에서 "›" 없음 (`activity-tab.tsx:267`)
- [OK] 행 "커리어 · 어제" / 제목 / "댓글 18 · 조회 412" (`activity-tab.tsx:241-257`)

### 마이-내-활동 › 마이 · 내 활동 · 게시글 상세 — S
- [없음] 상단 더 보기 버튼(내 글 메뉴). 앱 `TopBar`에 오른쪽 버튼 없음 (`src/screens/social/post-detail-screen.tsx:18`)
- [OK] "댓글 18" (`src/features/social/components/post-header.tsx:20`), "답글 달기" (`comment-row.tsx:23`), "댓글을 남겨 주세요" (`comment-composer.tsx:39`)

### 마이-내-활동 › 마이 · 내 활동 · 내가 쓴 글 전체 — S
- [OK] 제목 "내가 쓴 글", 행 구성 (`src/screens/my/my-posts-screen.tsx:17-46`)
- [없음] 목록 위 "8개" 개수 줄, 상단 더 보기 버튼

### 마이-내-활동 › 마이 · 내 활동 · 팔로잉 전체 — M
- [OK] 제목 "팔로잉", 검색 "이름이나 직무로 찾기" (`src/screens/my/follows-screen.tsx:20-37`)
- [없음] 행마다 "팔로잉" 토글 버튼 (앱 행은 아바타·이름·헤드라인만, `follows-screen.tsx:44-54`), 개수 "18명", 상단 더 보기

### 마이-내-활동 › 마이 · 내 활동 · 팔로잉 › 프로필 — S
- [OK] 상단 "팔로잉" · 공유 · 제안하기 (`src/screens/hub/profile-detail-screen.tsx:34-50`)
- [상태] 본문(소개·경력·기술 스택)은 네이티브가 아니라 웹뷰 `DetailWebView` (`profile-detail-screen.tsx:60`). 디자인과 맞는지는 fo-web 화면 기준
- [상태] 디자인 상단 제목은 비어 있음. 앱은 웹 제목을 받아 씀 (`profile-detail-screen.tsx:57`)

### 마이-내-활동 › 마이 · 내 활동 · 지원한 공고 상세 — L
- [상태] 앱은 "지원 현황"이라는 간단한 화면: 회사·직무·날짜·단계 이름·버튼 2개 (`src/screens/my/application-detail-screen.tsx:15-37`)
- [없음] 공고 머리(로고·"모아페이 · 핀테크"·직무·배지 "서울 강남구/경력 4–6년/정규직"), 단계 트래커 "면접 진행 중 · 10월 14일 지원" + 단계별 날짜(10.14/10.17/10.21), 다음 일정 카드 "10월 21 · 결제 플랫폼팀 1차 면접 · 내일 오후 3:00 · Google Meet", 적합도 카드(6.9 · "내 적합도 · 김서준_백엔드_이력서_2026" · "조금만 고치면 8점대예요" · 기술 스택/경험 연관성/키워드 막대 · 경고), 하는 일/자격 요건/우대 사항/근무 조건, "원문 보기 · 모아페이 채용 사이트", 상단 북마크·공유
- [없음] 하단 "지원한 서류" 버튼. [추가] 앱의 "공고 보기" 버튼 (`application-detail-screen.tsx:36`). [OK] "Push 에이전트로 면접 준비" (`src/features/my/utils/my-rules.ts:98`)
- [상태] 면접 준비 버튼이 지원 맥락 없이 에이전트 첫 화면으로 감 (`application-detail-screen.tsx:35`)
- [BE] `Application`에 단계별 시각이 없음 (openapi `Application`: `appliedAt`, `nextActionAt`만) → 서류 통과·면접 날짜를 못 그림

### 마이-내-활동 › 마이 · 내 활동 · 북마크한 공고 상세 — S
- [문구] 디자인 "에이전트로 맞추기" vs 앱 "AI로 맞추기" (`src/screens/jobs/posting-detail-screen.tsx:56`)
- [OK] "지원하기" (`posting-detail-screen.tsx:61`), 상단 북마크·공유 (`posting-detail-screen.tsx:30-38`)
- [상태] 본문(D-13 배지·적합도 카드·섹션)은 웹뷰 (`posting-detail-screen.tsx:42`)

### 마이-내-활동 › 마이 · 내 활동 · 캘린더 · 상태 — L
- 일정 추가 시트: [OK] "어떤 일정을 추가할까요?", "일정 이름", 유형 칩, "일정 추가하기" (`calendar-view.tsx:37-58`)
  - [네이티브] 디자인은 날짜 필드 "10월 23일 (금)"과 시간 필드 "오후 2:00"(피커). 앱은 피커 없이 설명 "M월 D일 오전 9:00"만 쓰고 9시로 고정 (`calendar-view.tsx:38,45`). iOS `DatePicker` / Android Material 날짜·시간 피커 필요
  - [상태] 기본 유형이 디자인 "면접", 앱 `CUSTOM`(직접 추가) (`calendar-view.tsx:28`)
  - [추가] X 닫기 (공통 `BottomSheet`)
- Google 연결 안 됨 · 빈 날: [OK] "Google 연결 안 됨", "이날은 일정이 없어요." (`calendar-view.tsx:202,209`). 범례 없음은 위 캘린더 항목과 같음

### 마이-내-활동 › 마이 · 내 활동 · 빈 상태 — S
- [문구] 끝에 마침표 없음 (`src/features/my/utils/my-rules.ts:77-83`): 디자인 "아직 지원한 공고가 없어요." / "북마크한 공고가 없어요." / "아직 팔로우한 사람이 없어요." / "아직 쓴 글이 없어요."
- [상태] 빈 상태 버튼: 디자인 `btn sec2 sm`, 앱 `Empty`는 primary sm (`src/features/my/components/empty.tsx:10`, Button 기본 `variant='primary'`)
- [추가] 지원활동·북마크 빈 화면 위에 "지원한 공고 0개"/"북마크한 공고 0개" 제목 (`activity-tab.tsx:42,82`). 팔로우 빈 화면에 "팔로워 N명 보기" (`activity-tab.tsx:202-205`). 게시글 빈 화면에 "댓글 단 글 N개 보기" (`activity-tab.tsx:266-269`)
- [OK] 버튼 "채용공고 보기"/"허브 둘러보기"/"글쓰기" (`my-rules.ts:75-84`)

---

## 16 · 마이 › 제안함

### 마이-제안함 › 마이 · 받은 제안 — S
- [OK] 제목 "받은 제안", 세그먼트 "받은 제안 4 / 보낸 제안 3" (`src/screens/my/offers-screen.tsx:61-70`), 배지 "새 제안/수락함/거절함" (`src/features/my/utils/offer-badge.ts:8-11`), 안 읽음 점, 안내 "허브 프로필이 공개돼 있어야 제안을 받을 수 있어요." (`offers-screen.tsx:86`)
- [상태] 회사 줄: 디자인 "모아페이 · 결제 플랫폼팀 채용 담당"(회사 · 헤드라인), 앱은 `companyName`만 (`offers-screen.tsx:33-37`)
- [상태] 회사 계정이 보낸 제안("그린티켓 채용팀")은 디자인에서 로고, 앱은 늘 아바타 (`offers-screen.tsx:22`)
- [네이티브] 세그먼트는 JS `SegmentedControl` (`offers-screen.tsx:63`)

### 마이-제안함 › 마이 · 받은 제안 상세 — S
- [문구] 디자인 "에이전트가 적합도를 보고 이력서를 고쳐 드려요" vs 앱 "AI가 적합도를 보고 이력서를 고쳐 드려요" (`src/screens/my/offer-detail-screen.tsx:264`)
- [없음] 상단 더 보기 버튼 (`offer-detail-screen.tsx:169`)
- [상태] 회사 줄에 헤드라인 없음 (위와 같음, `offer-detail-screen.tsx:183-187`)
- [상태] "답장 전에 이 공고에 맞춰 볼까요?"를 누르면 공고 맥락 없이 에이전트 첫 화면으로 감 (`offer-detail-screen.tsx:247`)
- [OK] "허브 프로필 보기", 말풍선 카드, "10월 20일 오전 1:42 · 받음" (`offer-detail-screen.tsx:191,206`), "함께 보낸 공고" 카드 "서울 강남구 · 경력 5년+ · D-21", 하단 "거절"/"수락하고 답장하기" (`offer-detail-screen.tsx:287-299`)

### 마이-제안함 › 마이 · 보낸 제안 — S
- [OK] 제목 "제안함" (`offers-screen.tsx:61`), 배지 "읽지 않음/수락함/거절함" (`offer-badge.ts:11`), 안내 "상대가 읽으면 ‘읽음’으로 바뀌고, 수락하면 대화를 시작할 수 있어요." (`offers-screen.tsx:87`)
- [상태] 행에 상대 사진과 "누리클라우드 · 프론트엔드 개발자"가 없음. `counterpart`가 sent일 때 `recipient`를 돌려주는데 (`src/features/my/utils/counterpart.ts:6-7`) recipient에는 이름만 있음
- [BE] `Offer.recipient`가 `{id, displayName}`뿐 (openapi `Offer.recipient`). `avatarUrl`, `companyName`, `headline` 필요 (`GET /me/offers?box=sent`, `GET /me/offers/{id}`)

### 마이-제안함 › 마이 · 제안 메시지 — L
- [상태] 디자인은 따로 있는 대화 화면: 상단에 아바타·"오지현"·"모아페이 · 결제 플랫폼팀 채용 담당"·더 보기, 맨 위에 공고 카드, 날짜 구분선 "10월 20일", 첫 말풍선이 원래 제안 메시지, 말풍선마다 시각만 표시, 하단 입력창. 앱은 상세 화면 안의 "메시지" 섹션 (`src/screens/my/offer-detail-screen.tsx:45-132,271`)
- [문구] 입력창 안내: 디자인 "메시지를 입력해 주세요" vs 앱 "메시지 보내기" (`offer-detail-screen.tsx:88`)
- [상태] 시각: 디자인은 "오전 9:10"만, 앱은 말풍선마다 "M월 D일 오전 9:10" (`offer-detail-screen.tsx:77-79`)
- [상태] 전송 실패: 디자인은 그 말풍선 아래 "! 메시지를 보내지 못했어요" + 다시 보내기 버튼. 앱은 입력창 아래 "메시지를 보내지 못했어요. 잠시 뒤에 다시 보내 주세요." 한 줄이고 다시 보내기 없음 (`offer-detail-screen.tsx:125-129`, `my-rules.ts:101-103`)
- [없음] 별도 라우트 (`src/app/offers/`에는 `index.tsx`, `[id].tsx`만 있음)
- [BE] 상대가 보낸 사람일 때 상단 헤더에 쓸 recipient 정보는 위 `Offer.recipient` 항목과 같음

### 마이-제안함 › 제안함 · 상태 — M
- 받은 제안 · 빈 상태: [OK] "아직 받은 제안이 없어요." + "허브 프로필 다듬기" (`offers-screen.tsx:76-78`, `my-rules.ts:104`). [상태] 버튼이 디자인 sec2, 앱은 primary (`empty.tsx:10`)
- 수락 시트: [OK] "어떻게 답장할까요?" / "수락하면 내 연락처가 상대에게 보이고, 답장이 첫 메시지가 돼요." / "오지현 님에게 답장을 써 주세요." / "수락하고 보내기" (`offer-detail-screen.tsx:303-321`). [추가] X 닫기
- 수락 · 보내는 중: [OK] 버튼 "보내는 중" 비활성 (`offer-detail-screen.tsx:309-311`)
- 거절 확인: [OK] "이 제안을 거절할까요?" / "오지현 님에게 거절했다고 알려요." / 취소·거절 (`offer-detail-screen.tsx:293-296`). [네이티브] 가운데 다이얼로그 = `Alert.alert` 시스템 다이얼로그 ✓
- 메시지 · 빈 상태: [OK] "첫 메시지를 보내 대화를 시작해 보세요." (`offer-detail-screen.tsx:57`). [상태] 디자인은 별도 대화 화면 + 공고 카드 (위 L 항목)

---

## 17 · 마이 › 설정

### 마이-설정 › 마이 · 설정 — L
- [문구] 일반 안내: 디자인 "앱 화면과 에이전트 답변 언어가 함께 바뀌어요." vs 앱 "앱 화면과 AI 답변 언어가 함께 바뀌어요." (`src/screens/my/settings-screen.tsx:252`)
- [문구] 알림: 디자인 "에이전트 작업 완료" vs 앱 "AI 작업 완료" (`src/features/my/utils/my-rules.ts:113`)
- [문구] 에이전트 안내: 디자인 "마이 › 서류와 북마크 공고를 에이전트가 읽어서 이력서를 고쳐요. …" vs 앱 "…AI가 읽어서…" (`my-rules.ts:118`)
- [추가] "대화 기록 보관" 행과 7/30/90/무제한 시트 (`settings-screen.tsx:309-316,362-369`, `src/features/my/constants.ts:88-90`). 디자인에 없고, 2026-10-29 결정(보관 = 사용자가 지울 때까지)과도 어긋남. BE `UserSettings`에도 `chatRetentionDays`가 없는데 앱이 이 값을 보냄 (`settings-screen.tsx:366`)
- [네이티브] 테마: 디자인은 3칸 세그먼트(iOS 글래스), 앱은 글자 3개 라디오 (`settings-screen.tsx:257-275`). iOS `@expo/ui` Picker(segmented) / Android SegmentedButton으로 바꿔야 함
- [네이티브] 스위치는 RN `Switch` (`src/shared/components/switch.tsx:7`): iOS는 UISwitch 네이티브 ✓. Android 디자인은 Material 3 스위치(52×32)인데 RN `Switch`는 예전 스타일
- [상태] 고객센터·약관 및 정책 행이 아무 데도 안 감 (`settings-screen.tsx:339-341`, shortcut)
- [상태] 로그인 방식 줄: `LOGIN_LABEL`에 google/github/email만 있음 (`constants.ts:108-112`). Apple·전화 로그인 사용자는 빈 줄로 보임 (2026-10 결정: 개인 로그인 = Google/Apple/GitHub/전화)
- [OK] 계정 행, 섹션 일반/알림/허브 공개/에이전트/기타, 알림 보조 문구 2개 (`settings-screen.tsx:186-189`), "참고 데이터 제공" + "에이전트를 쓰려면 켜 두어야 해요" (`my-rules.ts:119-120`), 커리어 상태 "모두에게"·연락처 "제안 수락한 사람만"·기본 말투 "그대로"

### 마이-설정 › 설정 · 언어 선택 — L
- [OK] 버튼 "한국어", 팝오버 항목 한국어/English + 체크 (`settings-screen.tsx:93-170`, `constants.ts:104-107`)
- [네이티브] 디자인 팝오버 메뉴 = iOS 풀다운 메뉴 / Android 드롭다운 메뉴. 앱은 `Modal` + `Glass`로 직접 그린 JS 팝오버이고 위치를 손으로 계산함 (`settings-screen.tsx:107-109,126-167`)

### 마이-설정 › 설정 · 커리어 상태 공개 범위 — S · OK
- [OK] 제목 "커리어 상태", 안내 "‘이직/구직중’ 같은 커리어 상태를 누가 볼 수 있는지 정해요.", 모두에게/팔로워에게만/나만 보기와 보조 문구 "나를 팔로우한 사람 12명", 안내 "지금 다니는 회사 사람에게는 커리어 상태가 보이지 않아요.", "회사 숨기기" / "모아페이 사람에게 숨기기" / "같은 회사 이메일로 가입한 사람" (`src/screens/my/settings-visibility-screen.tsx:34-86`, `constants.ts:95-103`, `my-rules.ts:124`)

### 마이-설정 › 마이 · 설정 · 상태 — M
- 로그아웃 확인: [OK] "로그아웃할까요?" 취소/로그아웃 (`settings-screen.tsx:210-214`). [네이티브] `Alert.alert` 시스템 다이얼로그 ✓
- 회원 탈퇴 확인: [OK] 제목과 본문이 글자까지 같음 (`settings-screen.tsx:215-228`, `my-rules.ts:126-127`). [네이티브] ✓
- 연락처 공개: [OK] "누구에게 연락처를 보여 줄까요?" / 제안 수락한 사람만 / 모두에게 (`settings-screen.tsx:346-353`). [추가] X 닫기. [네이티브] 디자인은 그랩 있는 시트(iOS sheet detent), 앱은 커스텀 `BottomSheet`(Modal)
- 기본 말투: [문구] 디자인 "에이전트가 어떤 말투로 쓸까요?" vs 앱 "AI가 어떤 말투로 쓸까요?" (`settings-screen.tsx:355`). [OK] 6개 그대로/전문적인/자신감 있는/간결한/기술 중심/친근한 (`constants.ts:80-87`). [추가] X 닫기

---

## 요약

| 항목 | 값 |
|---|---|
| artboard 수 | 44 (13: 7 · 14: 15 · 15: 13 · 16: 5 · 17: 4) |
| OK (그대로 맞음) | 5 — 프로필 편집·기술 스택, 서류 올리는 중, 내 활동(지원활동), 내 활동·북마크, 설정·커리어 상태 공개 범위 |
| S | 21 |
| M | 16 |
| L | 7 — 프로필 편집·경력(월 피커), Push 서류 보기(페이지), 지원한 공고 상세, 캘린더·상태(날짜/시간 피커), 제안 메시지(별도 화면), 마이·설정(테마 세그먼트), 설정·언어 선택(네이티브 메뉴) |

**[BE] 항목**
1. `Offer.recipient`에 `avatarUrl`·`companyName`·`headline` 추가 (`GET /me/offers?box=sent`, `GET /me/offers/{id}`) — 보낸 제안 행, 메시지 헤더
2. `Application`에 단계별 시각 추가(서류 통과·면접·결과 날짜) — 지원한 공고 상세 단계 트래커. 지금은 `appliedAt`, `nextActionAt`만 있음
3. `CalendarEvent`에 장소 필드 추가 — 캘린더 "Google Meet · 1시간"
4. 업로드 서류 → 허브 프로필 섹션 골라 반영: `POST /documents/{id}/profile`(또는 `/base-profile`) 바디에 섹션 목록 추가. 그리고 앱이 이 엔드포인트에 upload source id를 넣는 문제 (`src/features/my/api/fetchers.ts:126-127`) 확인
5. (BE 변경 아님) 앱이 `UserSettings`에 없는 `chatRetentionDays`를 보냄 → 앱에서 행을 지우는 쪽 (2026-10-29 결정)

**[네이티브] 항목**
1. 세그먼트: 마이 탭(프로필/서류/내 활동), 제안함(받은/보낸), 프로필 편집 커리어 상태 → 지금 JS `SegmentedControl`. 설정 테마는 세그먼트조차 아니고 글자 라디오
2. 메뉴: 설정 언어 팝오버(직접 그린 Modal+Glass), 서류 ⋯ 시트, 직군·연차 선택 → iOS 메뉴/액션 시트, Android 드롭다운
3. 날짜·시간 피커: 경력 시작·종료(텍스트 입력), 일정 추가 날짜·시간(없음, 9시 고정)
4. 하단 시트: 공통 `BottomSheet`가 Modal로 만든 JS 시트이고 X 버튼을 더 그림. 디자인 `sheet2`(그랩만) — iOS sheet detents / Android Material bottom sheet 아님
5. 확인 창: 로그아웃·탈퇴·제안 거절은 `Alert.alert` 네이티브로 디자인과 맞음 ✓. 경력 삭제·서류 삭제·기본 프로필 설정은 디자인이 하단 확인 시트인데 앱은 `Alert.alert`
6. 그 밖: 스위치 = RN `Switch`(iOS ✓, Android는 Material 3 아님). 탭 바 = `NativeTabs` ✓. 프로필 편집 = 네이티브 modal ✓. 상단 바·토스트 = JS 커스텀
