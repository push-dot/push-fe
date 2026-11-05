# G2 · 에이전트 갭 분석 (05~10 페이지, 85개 아트보드)

- 디자인: `docs/design-handoff/push-app/` 05~09 HTML(번들 해제 후 DOM 텍스트), 10-에이전트-Flow 31개 `*.dc.html`
- 앱: push-fe `develop` @ `fc4c872`, `apps/fo-mobile/src` (경로는 이 기준 상대 경로)
- 서버: push-be `develop` @ `c558b73`, `services/ai/src/app` (경로는 `be:` 접두)
- 채팅 화면: `screens/chat/chat-home-screen.tsx`(첫 화면), `screens/chat/conversation-screen.tsx`(대화), 렌더러 `features/chat/components/items.tsx`, 승인 패널 `features/chat/components/approval-panel.tsx`, SSE→항목 매핑 `features/chat/utils/stream.ts`, 서버 이벤트 타입 `packages/api-client/src/types.ts:247-296`(push-fe 루트)

## 공통 사항 (여러 아트보드에 반복되는 갭)

- **C1 [없음]** 단일 선택 패널 아래 안내 "번호를 누르거나 바로 말해도 돼요"가 없어요. `features/chat/utils/stream.ts:12`는 '어떤 문제를 예방할까요?' 다중 선택에만 foot을 넣고, 패널은 foot이 있을 때만 그려요(`features/chat/components/approval-panel.tsx:148`).
- **C2 [추가]** 서버 `recommended` 옵션에 '추천' 배지를 붙여요(`features/chat/utils/stream.ts:21`). 디자인의 게이트 패널에는 배지가 없고, 템플릿 고르기(10-22)에만 '추천'이 있어요.
- **C3 [BE]** 도구 줄: 서버 `tool` 이벤트는 `summary`만 보내요(`be:harness/graph.py:276`, `be:harness/personal/resume/graph.py:802`). 앱은 `action`=summary만 그려요(`features/chat/utils/stream.ts:36`). 디자인 도구 줄은 대상("김서준_백엔드_이력서_2026.pdf", "모아페이 · 백엔드 엔지니어"), ⎿ 결과 한 줄("2쪽 · 경력 2건, 프로젝트 5건, 링크 3개"), 접힌 줄("+6줄")을 함께 보여 줘요. 그래서 `tool` 이벤트에 `target`·`resultLine`·`extra[]` 필드가 필요해요. 앱 렌더러는 이미 `target/result/extra`를 지원해요(`features/chat/components/items.tsx:86-154`, `features/chat/types.ts:17`).
- **C4 [BE]** 할 일 목록: 서버는 present 단계에서 전부 `done`인 `todo`를 한 번만 보내요(`be:harness/personal/resume/graph.py:519-526`, `:961`, `:969`). 디자인은 단계마다 진행 중인 할 일(now 굵게·깜빡, done 취소선)과 '새로 추가' 배지를 보여 줘요. 그래서 단계별 `todo` 송신과 항목 `added` 필드가 필요해요(앱 `TodoRow`는 `added` 지원, `features/chat/components/items.tsx:183`, `stream.ts:78`에서는 매핑 안 됨).
- **C5 [BE]** 적합도 카드: 채팅 하네스에는 `type:"fit"` 이벤트를 보내는 곳이 없어요(services/ai/src/app/harness 전체 grep 결과 0건). 앱은 `score`·`parts`(3개)·`topGap`만 매핑해요(`features/chat/utils/stream.ts:82`, `features/chat/constants.ts:28-32`). 디자인에는 아래 필드가 있어요.
  - 항목 5개(기술 스택·경험 연관성·경력 수준·키워드·도메인)
  - 키워드 칩 `{label, ok}`
  - 구간 문구("보통 · 개선 여지 있어요"), 요약("기술 스택은 잘 맞아요. …")
  - 예상 상승 `from/delta`("+1.2 예상")
  - 예상 점수("이렇게 고치면 8점대")와 펼침 목록
  - 요금제별 노출(FREE 잠금·PRO 티저·ULTRA 전체)
- **C6 [BE]** 완료 요약 "다 됐어요! 적합도를 6.9 → 8.1로 올렸어요." 아래에 숫자 강조와 • 목록 3줄이 와요. 서버는 자유 텍스트 `token`만 보내고(`be:harness/personal/resume/graph.py` `emit({"token": reply})`, ~`:972`), 앱 `AgentText.bullets`는 스트림에서 채워지지 않아요(`features/chat/utils/stream.ts:31`). 그래서 `result`에 `summary`·`fitFrom`·`fitTo`·`bullets[]` 같은 구조 필드가 필요해요.
- **C7 [상태]** 대화를 다시 열면 USER/ASSISTANT 텍스트만 복원돼요(`features/chat/stores.ts:233-240`). 할 일·도구 줄·diff·결과 카드가 사라져요. **[BE]** `GET /conversations/{id}/messages`가 카드 이벤트를 저장하지도, 다시 보내지도 않아요.

---

## 05 에이전트 (21)

### 에이전트 › 에이전트 · 첫 화면 — OK
- [OK] 왼쪽 위 '대화 목록 열기' 버튼, 가운데 흐린 "Push." 워드마크, 빠른 시작 알약 13개(순서 동일), 입력창(placeholder "공고 링크를 붙여넣어 보세요", + · @언급 · 자동 · 마이크 · 보내기) (`screens/chat/chat-home-screen.tsx:19-41`, `features/chat/constants.ts:107-182`)
- [네이티브] 하단 탭 바 = iOS Liquid Glass 탭 바 / Android 내비게이션 바. 앱은 `NativeTabs`로 네이티브예요(`app/(tabs)/_layout.tsx:6`). 입력창은 iOS `Glass`(expo-glass-effect), Android는 단색 상자예요(`features/chat/components/composer.ios.tsx:7`, `composer.android.tsx:9`).

### 에이전트 › 에이전트 · 실행 방식 시트 — S
- [문구] 시트 제목: 디자인 "에이전트가 어떻게 실행할까요?" vs 앱 "AI가 어떻게 실행할까요?" (`features/chat/constants.ts:16`)
- [OK] 옵션 3개 제목·설명 일치(`features/chat/constants.ts:10-14`)
- [네이티브] 디자인은 grabber 있는 바텀 시트(iOS sheet detent 형태)예요. 앱은 JS `Modal` 기반 `BottomSheet`예요(`features/chat/components/mode-picker.tsx:26`, `shared/components/bottom-sheet.tsx:20`).

### 에이전트 › 에이전트 · 작업 중 — M
- [OK] 첨부가 달린 사용자 말풍선, 에이전트 문장, '할 일' 카드 틀(제목·n/m), 대기 칩 "대기 중 · …", 상태 줄 "✻ 맞춰보는 중… 14초 중지", placeholder "작업 중에도 말할 수 있어요", 검은 중지 버튼 (`features/chat/components/items.tsx:40-59`, `:193-210`, `:595-608`, `features/chat/components/status-row.tsx:15-58`, `screens/chat/conversation-screen.tsx:93`)
- [BE] 도구 줄의 대상·결과 줄·"+6줄"(C3)
- [BE] 진행 중 할 일 목록(이력서 읽기 ✓ … 적합도 계산 진행 중)(C4)
- [BE] 상태 동사 "맞춰보는 중…"은 `status` 이벤트 `text`로 와야 해요. 앱 기본값은 '생각하는 중…'이에요(`features/chat/utils/reducer.ts:16`).

### 에이전트 › 에이전트 · 변경 확인 — M
- [BE] 적합도 카드 "적합도 … +1.2 예상", 항목 막대 3개(C5)
- [BE] diff 미리보기: 디자인은 승인 **전에** 바뀐 줄을 보여 줘요. 서버는 적용 **후에** `diff`를 보내요(`be:harness/personal/tools.py:290`). 승인 이벤트 앞에 미리보기 diff(또는 approval에 `hunks`)가 필요해요.
- [BE] 도구 줄 "이력서 수정 · 경력 · 모아페이 · 2줄 추가, 1줄 삭제"(C3)
- [OK] 질문 "이 수정을 적용할까요?", 옵션 '적용'/'그대로 두기' (`be:harness/personal/tools.py:257-262`)
- [상태] 디자인은 '그대로 두기'(보조)·'적용'(주) 두 버튼을 가로로 놓아요. 앱은 서버 옵션 순서대로 번호 행 2개(1 적용, 2 그대로 두기)로 그려요(`features/chat/components/approval-panel.tsx:29`, `:48-60`).
- [없음] 안내 문구(C1)

### 에이전트 › 에이전트 · 중단하고 다시 요청 — M
- [OK] 중단된 도구 줄 "중단됨 · 어떻게 할지 알려 주세요" (`features/chat/utils/reducer.ts:43`)
- [BE] "생각함 · 6초": 앱에 `think` 항목은 있지만(`features/chat/components/items.tsx:536-544`) 스트림에 대응 이벤트가 없어요(`StreamEvent`에 없음, `packages/api-client/src/types.ts:247-296`).
- [BE] 할 일에 "자기소개서 초안 쓰기 · 새로 추가" 끼워 넣기(C4의 `added`)
- [없음] 다시 시작한 도구 줄의 '이어서' 표시. 앱 `ToolLine`에 해당 태그가 없어요(`features/chat/components/items.tsx:86-154`).
- [BE] 상태 동사 "다시 맞춰보는 중…"(status 이벤트)

### 에이전트 › 에이전트 · 진행 상태 — M
- [OK] 자동 선택 한 줄 "자동으로 골랐어요: 모던 템플릿" (`features/chat/utils/stream.ts:42-43`), "42초 동안 작업했어요" (`features/chat/components/items.tsx:569-577`), "확인을 기다리고 있어요" (`features/chat/constants.ts:26`), 혼잡 오류 "지금 요청이 많아요. 12초 뒤에 다시 보내 주세요." (`features/chat/constants.ts:57`)
- [BE] 결과 파일 카드 "A4 1쪽 · 186KB": `file` 이벤트에 크기·쪽수가 없어서 앱이 meta를 비워 둬요(`features/chat/utils/stream.ts:46`). `file`에 `meta`(또는 pages/size)가 필요해요.
- [BE] 지원 도구 줄 "지원하기 · 모아페이 · 백엔드 엔지니어 · 김서준_….pdf / 지원했어요 · 마이 › 내 활동에 기록했어요"(C3)
- [BE] "다 됐어요! 적합도를 6.9 → 8.1로 올렸어요."(C6)

### 에이전트 › 에이전트 · @언급 · 처음 — S
- [OK] 그룹 '북마크 공고'·'마이 › 서류'·'내 링크'·'바로가기', 공고 줄 "모아페이 · 서울 강남구" (`features/chat/api/hooks.ts:170-192`)
- [문구] 서류 sub: 디자인 "에이전트로 만듦 · 10분 전" vs 앱 "AI로 만듦 · …" (`features/chat/api/hooks.ts:182`)
- [문구] 링크 sub: 디자인 "공고 · careers.moapay.kr/jobs/1182"(종류 · 주소) vs 앱 주소만 (`features/chat/api/hooks.ts:186`)
- [상태] 바로가기: 디자인은 3개(공고 링크로 맞추기·부족한 점 찾기·적합도 보기), 앱은 13개 전부예요(`features/chat/api/hooks.ts:188`).
- [상태] 실제 모드에서는 `aiMade`가 채워지지 않아 '…로 만듦'이 아예 안 나와요. `realDocs`가 `origin`을 버려요(`features/chat/api/fetchers.ts:16-17`). `SourceItem.origin`은 이미 있어요(`packages/api-client/src/types.ts:167-171`).

### 에이전트 › 에이전트 · @언급 — S
- [OK] "@모아" 필터, 첫 항목 강조, 일치 글자 강조, 바로가기 숨김 (`features/chat/components/composer-area.tsx:140-213`)
- [문구] 서류·링크 sub는 위 아트보드와 같은 차이(`features/chat/api/hooks.ts:182`, `:186`)

### 에이전트 › 에이전트 · 대화 더 보기 — M
- [없음] 더 보기 메뉴의 '고정'·'보관'. 디자인 순서는 이름 바꾸기 · 쓴 서류·공고 보기 · 대화 공유 · 고정 · 보관 · 대화 삭제, 앱은 4개예요(`screens/chat/conversation-screen.tsx:77-91`).
- [OK] '이름 바꾸기'·'쓴 서류·공고 보기'·'대화 공유'·'대화 삭제'(빨강, 위 구분선)
- [네이티브] 디자인은 오른쪽 위 Glass 풀다운 메뉴(iOS UIMenu / Android 드롭다운 메뉴)예요. 앱은 JS `Modal` + `Glass`로 직접 그려요(`screens/chat/conversation-screen.tsx:226-266`).
- [상태] 배경 대화의 결과 카드·할 일·도구 줄은 다시 열면 사라져요(C7).

### 에이전트 › 에이전트 · 대화 목록 (#10, 사이드바 + 전체 목록) — M
- [OK] 사이드바: 프로필(서준·김서준·PRO), 새 대화·내 서류·내 링크·북마크한 공고, 최근 대화(제목·배지·마지막 줄·시간), 모두 보기 (`features/chat/components/drawer.tsx:81-157`)
- [BE] 배지 '확인 필요'/'작업 중'과 마지막 진행 줄: 앱은 `ConversationRow.status`·`lastLine`을 기대해요(`features/chat/api/schemas.ts:4`, `features/chat/components/drawer.tsx:20-21`). push-be `GET /conversations`에는 두 필드가 없어요(push-be 전체 grep 0건).
- [상태] 전체 목록: 디자인은 고정된 대화를 맨 위에 제목 없이 따로 둬요("경력기술서 다듬기 · 어제"가 '오늘' 위). 앱은 날짜 그룹에 섞고 '고정' 글자만 붙여요(`features/chat/components/conversations-modal.tsx:23-36`, `:118-122`).
- [추가] 앱에는 '이전' 그룹이 있어요(`features/chat/components/conversations-modal.tsx:29`). 디자인은 '오늘'·'이번 주'만 보여 줘요.
- [네이티브] 전체 목록 = iOS pageSheet로 네이티브 표시예요(`features/chat/components/conversations-modal.tsx:181`).

### 에이전트 › 에이전트 · 대화 목록 · 길게 누름 — L
- [없음] 길게 누름 메뉴의 '이름 바꾸기'. 디자인은 이름 바꾸기·고정(고정 해제)·보관·삭제, 앱은 고정·보관·삭제만 있어요(`features/chat/utils/conversation-menu.ts:3-7`).
- [네이티브] iOS는 행이 떠오르는 컨텍스트 메뉴(UIContextMenu + 미리보기), Android는 롱프레스 팝업 메뉴예요. 앱은 `Alert.alert` 버튼 목록이에요(`features/chat/components/conversations-modal.tsx:80-88`).
- [OK] 고정된 행은 '고정 해제'로 바뀌어요(`features/chat/utils/conversation-menu.ts:4`).

### 에이전트 › 에이전트 · 대화 목록 · 빈 상태 — S
- [OK] "아직 대화가 없어요" + '새 대화 시작' (`features/chat/components/conversations-modal.tsx:145-152`)
- [추가] 빈 상태에서도 '보관한 대화' 행이 보여요(`features/chat/components/conversations-modal.tsx:153-159`). 디자인 빈 상태에는 없어요.

### 에이전트 › 대화 삭제 확인 · 에이전트 · 대화 목록 — OK
- [OK] "대화를 삭제할까요?" / "삭제한 대화는 되돌릴 수 없어요." / 취소 · 삭제 (`features/chat/utils/conversation-menu.ts:9-14`)
- [네이티브] 시스템 알림으로 그려요(`Alert.alert`, `features/chat/components/conversations-modal.tsx:65-78`). 디자인과 같은 네이티브 다이얼로그예요.

### 에이전트 › 에이전트 · 대화 목록 (#14, 보관한 대화) — OK
- [OK] 제목 '보관한 대화', 행마다 날짜·마지막 줄·'보관 해제', 하단 안내 "보관을 해제해도 대화에서 쓰던 자료와 첨부는 돌아오지 않아요." (`features/chat/utils/conversation-menu.ts:16-18`, `features/chat/components/conversations-modal.tsx:134-164`)

### 에이전트 › 에이전트 · 사용량 소진 — OK
- [OK] "이번 달 사용량을 다 썼어요. 요금제를 올리거나 크레딧을 구매할 수 있어요." + 요금제 올리기 · 크레딧 구매 (`features/chat/utils/usage.ts:1-7`, `features/chat/components/usage-exhausted.tsx:7-27`)

### 에이전트 › 에이전트 · 사용량 소진 · ULTRA — OK
- [OK] "이번 달 사용량을 다 썼어요. 크레딧을 구매하면 바로 이어서 쓸 수 있어요." + 크레딧 구매 (`features/chat/utils/usage.ts:2`, `:6`)

### 에이전트 › 에이전트 · 참고 데이터 동의 — S
- [문구] 본문: 디자인 "…다른 사용자와 기업의 에이전트가 참고 자료로 써요." vs 앱 "…기업의 AI가 참고 자료로 써요." (`features/chat/constants.ts:48`)
- [문구] 제목 줄바꿈: 디자인 "에이전트를 쓰려면\n동의가 필요해요" vs 앱 한 줄 (`features/chat/constants.ts:47`)
- [OK] 자세히 보기 · 동의하고 시작하기 · 나중에 · 하단 안내 (`features/chat/constants.ts:49-53`)
- [네이티브] grabber 바텀 시트예요. 앱은 JS `BottomSheet`예요(`features/chat/components/consent-sheet.tsx:28`).

### 에이전트 › 에이전트 · 큰 글씨 — S
- [상태] 앱 `Text`는 RN 기본 글자 크기 조절을 따르지만(`maxFontSizeMultiplier` 지정 없음) 높이가 고정된 곳이 있어요. 상태 줄 36px(`features/chat/components/status-row.tsx:33`), 입력창 버튼 40px(`features/chat/components/composer-body.tsx:30`, `:65`), 칩 28px(`features/chat/components/approval-panel.tsx:256`)는 큰 글씨에서 잘릴 수 있어요. 디자인은 줄이 늘어나게 그렸어요(렌더 검증 안 함).
- [BE] 내용은 '작업 중'과 같아요(C3, C4).

### 에이전트 › 에이전트 · 완료 (#19, 에이전트 미설정) — OK
- [OK] "지금은 에이전트를 쓸 수 없어요. 잠시 뒤에 다시 해 주세요." (`features/chat/constants.ts:42`), placeholder "공고 링크를 붙여넣어 보세요"(`screens/chat/conversation-screen.tsx:93`)

### 에이전트 › 에이전트 · 완료 (#20, 업로드 실패) — OK
- [OK] 첨부 말풍선 + "파일을 올리지 못했어요. 네트워크를 확인하고 다시 올려 주세요." (`features/chat/constants.ts:45`, `features/chat/stores.ts:150-151`)

### 에이전트 › 에이전트 · 완료 (#21, 이어가기 실패) — S
- [OK] "작업을 이어가지 못했어요. 다시 보내 주세요." (`features/chat/constants.ts:44`)
- [BE] 앞에 오는 '이력서 읽기' 도구 줄의 대상·결과 줄(C3)

---

## 06 에이전트 프로필 (1)

### 에이전트 프로필 › 에이전트 · 완료 (Push 프로필 수정) — M
- [OK] 결과 카드: '서준' 원형 아바타, 제목 "김서준 · 백엔드 엔지니어", 부제 "Push 프로필 · 방금 수정", 버튼 '모아페이에 바로 지원하기'(주)·'프로필 보기'(보조) (`features/chat/components/items.tsx:412-465`, `features/chat/utils/result-card.ts:29-32`, `be:harness/personal/resume/graph.py:557-574`)
- [OK] 할 일 5개(프로필 읽기 … 프로필에 저장) (`be:harness/personal/resume/graph.py:360-366`)
- [상태] 디자인 맨 위는 도구 줄 "프로필 수정 / Push 프로필 · 경력 / 반영했어요 · 2줄 추가, 1줄 삭제"예요. 앱은 `taskLine`("프로필 수정 · Push 프로필 · 경력")을 카드 위 굵은 글자로 그리고 결과 줄이 없어요(`features/chat/components/items.tsx:433-437`).
- [BE] 결과 줄 "반영했어요 · 2줄 추가, 1줄 삭제"에는 diff 통계가 필요해요(C3).
- [BE] 요약 "다 됐어요! 적합도를 X → Y로 올렸어요." + • 3줄(C6)
- [추가] `result.checklist`는 받지만 쓰지 않아요(`features/chat/types.ts:55`). 할 일은 별도 `todo` 이벤트로 그려요.

---

## 07 에이전트 외부 서류 (3)

### 에이전트 외부 서류 › 에이전트 · 완료 (#1, 저장됨 · 공고 있음) — M
- [OK] 파일 카드 "김서준_모아페이_백엔드.pdf" / "A4 1쪽 · 186KB · 내 서류에 자동 저장됨", 공유 아이콘, '모아페이에 바로 지원하기'·'프로필로 전환' (`features/chat/utils/result-card.ts:23-32`, `be:harness/personal/resume/graph.py:529-554`)
- [OK] 할 일 5개(이력서 읽기·공고 요건 정리·적합도 계산·경력 섹션 고치기·PDF로 만들기) (`be:harness/personal/resume/graph.py:353-359`)
- [상태] 맨 위 "이력서 수정 / 올린 파일 · 경력 / 반영했어요 · …"는 도구 줄인데, 앱은 `taskLine` 굵은 글자로 그려요(`features/chat/components/items.tsx:433-437`).
- [BE] 'PDF 만들기 · 모던 템플릿 · A4 1쪽 · 186KB' 도구 줄(C3), 요약·목록(C6)

### 에이전트 외부 서류 › 에이전트 · 완료 (#2, 공고 없음) — M
- [BE] **할 일 개수**: 디자인은 4개(이력서 읽기 · **고칠 점 찾기** · 경력 섹션 고치기 · PDF로 만들기), 서버는 공고가 없어도 항상 `_FILE_STEPS` 5개(이력서 읽기·공고 요건 정리·적합도 계산·경력 섹션 고치기·PDF로 만들기)를 보내요(`be:harness/personal/resume/graph.py:353-359`, `:961`). 결과의 `checklist`도 같은 5개예요(`:536`). 그래서 공고가 없을 때 쓸 단계 목록(`_FILE_STEPS_NO_POSTING`)이 필요해요. '고칠 점 찾기'는 서버에 아예 없어요.
- [OK] 파일 이름 "…_수정본.pdf" (`be:harness/personal/resume/graph.py:474-479`), 공고가 없으면 '바로 지원' 버튼 없음(`:510-512`), '프로필로 전환'만 있음
- [BE] 요약 "다 됐어요! 이력서를 고쳤어요."(적합도 문장 없음) + • 3줄(C6)
- [상태] 도구 줄 대신 `taskLine`을 그려요(#1과 같음).

### 에이전트 외부 서류 › 에이전트 · 완료 (#3, 저장 실패) — S
- [OK] meta "A4 1쪽 · 186KB"만 있고 '내 서류에 자동 저장됨'·'프로필로 전환'은 없어요(`be:harness/personal/resume/graph.py:541-554`).
- [BE] 요약·목록(C6), 도구 줄(C3)

---

## 08 에이전트 사이드바 (16)

### 에이전트 사이드바 › 에이전트 · 대화 목록 슬라이드 — S
- [OK] 왼쪽에서 밀려 들어오는 전체 폭 사이드바, 닫기 버튼 '사이드바 닫기' (`features/chat/components/drawer.tsx:45-98`)
- [BE] 최근 대화 배지·마지막 줄(05 #10과 같음)

### 에이전트 사이드바 › 에이전트 · 슬라이드 프로필 누름 — OK
- [OK] 프로필 줄을 누르면 배경이 바뀌고 계정이 열려요(`features/chat/components/drawer.tsx:82-97`).

### 에이전트 사이드바 › 에이전트 · 계정 프로필 — M
- [없음] '사용량 · 이번 달 64% 썼어요' 행. `Account.credits`(used/total)는 이미 받지만 그리지 않아요(`features/chat/api/schemas.ts:11`, `features/chat/components/account-modal.tsx:98-100`). 요금제 행은 'PRO'만 보여 줘요.
- [문구] 그룹 제목: 디자인 "에이전트가 참고하는 내 정보" vs 앱 "AI가 참고하는 내 정보" (`features/chat/components/account-modal.tsx:102`)
- [문구] 안내: 디자인 "대화를 시작할 때 에이전트가 이 정보부터 읽어요." vs 앱 "…AI가 이 정보부터 읽어요." (`features/chat/components/account-modal.tsx:102`)
- [추가] '대화' 그룹의 '작업 강도'·'대화 기록 보관' 행(`features/chat/components/account-modal.tsx:115-133`). 디자인 '대화' 그룹은 '그대로'(말투)·'실행 방식' 2행이에요.
- [문구] 실행 방식 행: 디자인은 라벨 "실행 방식", 앱은 현재 값(예: "자동")과 설명을 보여 줘요(`features/chat/components/account-modal.tsx:121-127`).
- [네이티브] 계정 = pageSheet(네이티브, `features/chat/components/page-modal.tsx:28`). 말투·실행 방식 고르기는 JS `BottomSheet` 라디오예요(`features/chat/components/account-modal.tsx:136-151`). iOS 인라인 메뉴 picker로 바꿀 만한 후보예요.

### 에이전트 사이드바 › 에이전트 · 계정 모달 › 요금제 — M
- [문구] 머리말: 디자인 "요금제마다\n쓸 수 있는 양이 달라요" vs 앱 "더 많이 맡기고\n더 빨리 붙어요" (`features/chat/components/account-modal.tsx:172`). 앱은 디자인 머리말을 맨 아래 안내로 옮겼어요(`:230`).
- [없음] ULTRA '추천' 배지(`features/chat/components/account-modal.tsx:180-183`에는 '지금 쓰는 중'만 있음)
- [문구] 하단: 디자인 "매월 1일에 사용량이 다시 채워져요." + "언제든 해지할 수 있어요" vs 앱 "매달 결제돼요 · 언제든 해지할 수 있어요" (`features/chat/components/account-modal.tsx:222`)
- [없음] '요금제 낮추기' 링크
- [추가] '구매 복원' 행(`features/chat/components/account-modal.tsx:227`). 디자인에는 없어요(앱스토어 정책상 필요할 수 있어요).
- [OK] 가격·사용량 문구, '크레딧 구매', CTA 'ULTRA로 업그레이드' (`features/chat/components/account-modal.tsx:156-160`, `:67`)

### 에이전트 사이드바 › 요금제 · ULTRA 사용 중 — S
- [OK] ULTRA '지금 쓰는 중' 배지, 비활성 버튼 "지금 ULTRA를 쓰고 있어요" (`features/chat/components/account-modal.tsx:65`, `:182`)
- [문구] 머리말·하단 문구는 위와 같은 차이, '요금제 낮추기' 없음

### 에이전트 사이드바 › 에이전트 · 내 서류 모달 (#6) — S
- [OK] 제목·행(파일 이름 / "2.4MB · 10월 12일")·하단 안내 "PDF, DOCX 파일을 20MB까지 올릴 수 있어요. 마이 › 서류와 같은 목록이에요." (`features/chat/components/docs-modal.tsx:14-46`)
- [문구] "에이전트로 만듦 · 10분 전" vs 앱 "AI로 만듦 · …" (`features/chat/components/docs-modal.tsx:11`). 실제 모드에서는 `aiMade`가 비어 있어요(`features/chat/api/fetchers.ts:16-17`).
- [상태] 행 오른쪽: 디자인 '더 보기'(⋯), 앱 공유 아이콘(`features/chat/components/docs-modal.tsx:29-37`)

### 에이전트 사이드바 › 에이전트 · 북마크한 공고 모달 (#7) — OK
- [OK] 필터 칩 '전체 4 / 마감 임박 2 / 지원 안 함 3', 행(로고·회사·직무·"서울 강남구 · 4–6년"), 안내 문구 (`features/chat/components/bookmarks-modal.tsx:29-57`)

### 에이전트 사이드바 › 에이전트 · 내 링크 모달 — OK
- [OK] 칩 '전체 7 / 공고 / GitHub / 포트폴리오 / 블로그 / 기타', 그룹 '공고 / GitHub / 포트폴리오 · 블로그', 상태 배지(맞춤 2회·읽음·읽는 중·프로필·저장소·포트폴리오·블로그), 안내 문구 (`features/chat/components/links-modal.tsx:14-47`, `:94-121`)

### 에이전트 사이드바 › 에이전트 · 내 링크 · 추가 — S
- [OK] '링크 추가' / "링크를 붙여넣으면 종류를 알아서 골라요." / 종류 칩 / '추가하기' (`features/chat/components/links-modal.tsx:209-226`)
- [문구] 디자인 "추가하면 에이전트가 README와 커밋을 읽어 둬요" vs 앱 "추가하면 AI가 README와 커밋을 읽어 둬요" (`features/chat/components/links-modal.tsx:230`)

### 에이전트 사이드바 › 에이전트 · 내 링크 · 더 보기 메뉴 — M
- [OK] 열기 · 링크 복사 · 에이전트에서 쓰기 · 삭제 (`features/chat/components/links-modal.tsx:127-133`)
- [네이티브] 디자인은 ⋯ 버튼에 붙는 팝오버 메뉴(iOS UIMenu / Android 드롭다운)예요. 앱은 JS `BottomSheet`예요(`features/chat/components/links-modal.tsx:124-142`).
- [상태] '링크 복사'가 클립보드 대신 공유 시트를 열어요(`features/chat/components/links-modal.tsx:64-65`, shortcut 주석).

### 에이전트 사이드바 › 에이전트 · 내 링크 · 빈 상태 — S
- [문구] 디자인 "아직 모아 둔 링크가 없어요." vs 앱 "아직 모아 둔 링크가 없어요"(마침표 없음) (`features/chat/components/links-modal.tsx:184`)
- [추가] 설명 "공고, GitHub, 포트폴리오, 블로그 링크를\n모아 두면 AI가 서류를 고칠 때 근거로 써요."(여기도 'AI가'), 3D 아이콘, 종류 칩 4개(`features/chat/components/links-modal.tsx:181-193`). 디자인은 문구 + '링크 추가'만 있어요.

### 에이전트 사이드바 › 에이전트 · 내 링크 · 삭제 확인 — M
- [문구] 본문: 디자인 "모아페이 · 결제 플랫폼 시니어 엔지니어 링크를 내 링크에서 지워요." vs 앱 링크 제목만 (`features/chat/components/links-modal.tsx:77`)
- [상태] 삭제 후 되돌리기: 디자인은 하단 토스트 "링크를 삭제했어요 · 되돌리기", 앱은 두 번째 `Alert`("링크를 삭제했어요" · 확인/되돌리기)예요(`features/chat/components/links-modal.tsx:85-88`).
- [네이티브] 확인 다이얼로그 = 시스템 Alert ✓. 되돌리기 = Android Material Snackbar / iOS 토스트예요. 앱은 Alert예요.

### 에이전트 사이드바 › 에이전트 · 내 서류 모달 (#13, 빈 상태) — M
- [없음] 빈 상태 "아직 등록한 서류가 없어요." + '파일 등록' · '에이전트로 만들기' 버튼. 앱은 빈 목록과 안내 문구만 보여 줘요(`features/chat/components/docs-modal.tsx:19-44`).

### 에이전트 사이드바 › 에이전트 · 북마크한 공고 모달 (#14, 빈 상태) — S
- [문구] 디자인 "북마크한 공고가 없어요." vs 앱 "해당하는 공고가 없어요" (`features/chat/components/bookmarks-modal.tsx:52-55`)
- [없음] '채용공고 보기' 버튼
- [추가] 빈 상태에서도 필터 칩과 안내 문구가 보여요(`features/chat/components/bookmarks-modal.tsx:30-34`, `:57`).

### 에이전트 사이드바 › 에이전트 · 대화 목록 (#15) — M
- 05 '대화 목록'(#10)과 같아요: [상태] 고정 섹션, [BE] status·lastLine, [추가] '이전' 그룹

### 에이전트 사이드바 › 에이전트 · 대화 목록 · 빈 상태 (#16) — S
- 05 '빈 상태'와 같아요: [추가] '보관한 대화' 행(`features/chat/components/conversations-modal.tsx:153-159`)

---

## 09 에이전트 빠른 시작 (13)

모든 시트는 JS `BottomSheet`(`shared/components/bottom-sheet.tsx`)예요. [네이티브] 디자인은 grabber 시트(iOS detent)라서 네이티브 시트로 바꿀 후보예요. 데이터는 실제 모드에서 기존 목록을 모아 만들어요(`features/chat/api/fetchers.ts:45-51`, `features/chat/utils/quick-start-data.ts`).

### 빠른 시작 › 빠른 시작 · 공고 링크로 맞추기 — S
- [OK] 제목·설명·"https://" 입력·'복사한 링크'·'붙여넣기'·'비교할 서류 … 변경'·'맞추기 시작' (`features/chat/constants.ts:109-111`, `features/chat/components/quick-start-sheet.tsx:76-98`, `:197-234`)
- [없음] 클립보드 미리보기 카드("복사한 링크 / careers.moapay.kr/jobs/1182"). 앱은 붙여넣기를 누르기 전에는 내용을 보여 주지 않아요(`features/chat/components/quick-start-sheet.tsx:78-96`).

### 빠른 시작 › 빠른 시작 · 나에게 맞는 공고 찾기 — M
- [BE] 조건 칩(개발 · 백엔드 / 경력 4–6년 / 서울 / Kotlin / Spring Boot): 실제 모드에서는 'match' 데이터 소스가 없어 칩이 비어요(`features/chat/utils/quick-start-data.ts:31`, `:82-83`, `QS_NEEDS`에 match 없음 `:87-98`). 프로필·서류에서 뽑은 매칭 조건 API가 필요해요.
- [OK] '조건 추가', "적합도 7점 이상인 공고만 보여 드려요" + 스위치, '공고 찾기' (`features/chat/components/quick-start-sheet.tsx:101-129`)
- [네이티브] 스위치 = RN `Switch`(네이티브, `shared/components/switch.tsx:7`) ✓

### 빠른 시작 › 빠른 시작 · 부족한 점 찾기 — M
- [없음] 세그먼트 '북마크 4 / 최근 본 공고'. 'gap' 데이터에 `segments`가 없어요(`features/chat/utils/quick-start-data.ts:35-38`).
- [BE] '최근 본 공고' 목록 API가 없어요.
- [문구] 행 sub: 디자인 "서울 강남구 · 4–6년" vs 앱 `p.location`만 (`features/chat/utils/quick-start-data.ts:38`)
- [OK] 제목·설명·'비교할 서류 … 변경'·'부족한 점 찾기' (`features/chat/constants.ts:118-121`)
- [네이티브] 세그먼트 = iOS UISegmentedControl / Android segmented button 후보예요. 앱 `SegmentedControl`은 JS예요(`shared/components/segmented-control.tsx:5-20`).

### 빠른 시작 › 빠른 시작 · 적합도 보기 (#4) — M
- 위와 같아요: [없음] 세그먼트, [BE] 최근 본 공고, [문구] sub. [OK] 제목·설명 (`features/chat/constants.ts:124-126`)

### 빠른 시작 › 빠른 시작 · 적합도 보기 (#5, 점수 올리기) — M
- [OK] 제목 "어떤 서류의 점수를 올릴까요?" · 설명 · '올릴 서류' · '점수 올리기 시작' (`features/chat/constants.ts:129-130`)
- [상태] '공고': 디자인은 고른 공고 하나를 필드 한 줄로 보여 줘요("모아페이 · 백엔드 엔지니어 (Kotlin·Spring)"). 앱은 '공고' 라벨 아래 북마크 전체를 라디오 목록으로 펼쳐요(`features/chat/components/quick-start-sheet.tsx:174-195`).

### 빠른 시작 › 빠른 시작 · 마감 임박 공고 정리 — M
- [OK] 제목 "마감 임박 공고 4개", 설명, D-n 배지, '준비할 일 정리하기' (`features/chat/components/quick-start-sheet.tsx:60`, `features/chat/utils/quick-start-data.ts:39-48`)
- [BE] 공고별 서류 상태 '서류 없음 / 서류 준비됨 / 초안 있음'(`QsItem.note`). 앱은 `note`를 그릴 수 있지만(`features/chat/components/quick-start-sheet.tsx:335-339`) 데이터에 없어요.

### 빠른 시작 › 빠른 시작 · 지원 현황 정리 — M
- [없음] 세그먼트 '진행 중 4 / 전체 6'(`features/chat/utils/quick-start-data.ts:49-54`에 segments 없음)
- [OK] 체크박스 행·단계 배지(면접/서류/지원함/합격)·"3개 정리하기" (`features/chat/constants.ts:142`)

### 빠른 시작 › 빠른 시작 · 캘린더 관리 — M
- [BE] '이번 주 3건' 일정 목록: 실제 모드에서는 `items: []`라 '이번 주 0건'이에요(`features/chat/utils/quick-start-data.ts:80-81`). 캘린더 일정 API 연결이 필요해요.
- [OK] 작업 카드 4개 문구, "Google 캘린더와 연결됨 · 변경", CTA "이번 주 정리하기" (`features/chat/constants.ts:184-189`, `features/chat/components/quick-start-sheet.tsx:397-463`)

### 빠른 시작 › 빠른 시작 · 허브 프로필 다듬기 — S
- [문구] 카드 sub: 디자인 '경력 · 2건' / '기술 스택 · 6개' vs 앱 '회사 · 역할' / '쓰는 기술' (`features/chat/utils/quick-start-data.ts:76-77`). 디자인은 프로필 데이터에서 개수를 세요.
- [OK] 헤드라인 · 한 줄 소개, 소개 · 3~4문장, '바탕이 될 서류', '다듬기 시작' (`features/chat/utils/quick-start-data.ts:74-75`, `features/chat/constants.ts:152-154`)

### 빠른 시작 › 빠른 시작 · 경험 만들기 — M
- [BE] 추천 경험 카드(제목·근거·출처 "모아페이 백엔드 · 우대 사항"): 최근 갭 분석 결과를 주는 API가 없어 실제 모드에서는 비어요(`features/chat/utils/quick-start-data.ts:31`, `:82-83`).
- [OK] '직접 입력하기', '프로젝트 기획 시작' (`features/chat/constants.ts:157`)

### 빠른 시작 › 빠른 시작 · 제안 답장 쓰기 — OK
- [OK] 아바타·이름·'새 제안' 배지·시간·소속 줄·미리보기, 행을 누르면 바로 시작(버튼 없음) (`features/chat/utils/quick-start-data.ts:55-67`, `features/chat/components/quick-start-sheet.tsx:297-356`)

### 빠른 시작 › 빠른 시작 · 커피챗 제안 쓰기 — M
- [없음] 세그먼트 '팔로잉 18 / 허브 추천'(`features/chat/utils/quick-start-data.ts:68-69`)
- [BE] '허브 추천' 사람 목록 API
- [OK] 제목·설명·행(아바타·이름·헤드라인)·'제안 글 쓰기' (`features/chat/constants.ts:170-172`)

### 빠른 시작 › 빠른 시작 · 커리어 글 쓰기 — M
- [BE] 추천 주제 카드("결제 승인 API p95를 절반 아래로 줄인 이야기 · 개발 · 이력서 경력에서" 등)가 없어 실제 모드에서는 비어요(`features/chat/utils/quick-start-data.ts:31`).
- [OK] '직접 주제 정하기', '초안 쓰기' (`features/chat/constants.ts:175`)

---

## 10 에이전트 Flow (31)

게이트 문구는 서버 `be:harness/personal/resume/graph.py:48-176`(`_GATES`)에서 오고, 앱은 그대로 그려요(`features/chat/utils/stream.ts:40-44`). '그만하기'/'그만할게요'는 서버가 analyze 외 모든 게이트에 붙여요(`be:harness/personal/resume/graph.py:603-609`). 디자인과 같아요.

### 에이전트 Flow › Phase 0 · 진행 방식 고르기 — S
- [OK] "좋아요! 시작하기 전에 하나만 여쭤볼게요." 다음에 "어떤 방식으로 진행할까요?" / 이력서부터 쓸게요 / 경험부터 정리할게요 / 그만하기 (`be:harness/personal/resume/graph.py:49-56`)
- [추가] '이력서부터 쓸게요'에 추천 배지(C2)
- [없음] 안내 문구(C1)

### 에이전트 Flow › Phase 0-I · 산출물과 자료 확인 — L
- [BE] 디자인은 패널 하나에 섹션 3개를 넣어요: '어떤 산출물을 만들까요?' 칩(다중) + '가져올 자료' 행 3개(파일·공고·GitHub, 각 '변경') + '어떤 말투로 쓸까요?' 칩. 서버는 게이트를 하나씩(`output_targets`, `tone`) 보내고, 앱은 `choices` 섹션 하나로만 만들어요(`features/chat/utils/stream.ts:8-26`). 앱 패널은 `chips`·`rows` 섹션을 이미 지원해요(`features/chat/components/approval-panel.tsx:62-102`). 그래서 서버가 다중 섹션 choice 이벤트(sections[])를 보내야 해요.
- [BE] 도구 줄 "자료 찾기 · 마이 › 서류 · 북마크 공고 · 이력서 3개 · 북마크 공고 2개 · GitHub 링크 1개"(C3)
- [OK] 옵션 문구: 산출물 이력서/포트폴리오/자기소개서, 말투 6개 (`be:harness/personal/resume/graph.py:57-78`)
- [상태] 행의 '변경'은 패널을 닫고 입력창으로 보내기만 해요(`features/chat/components/approval-panel.tsx:98`). 디자인은 자료 고르기 시트(다음 아트보드)를 열어요.

### 에이전트 Flow › Phase 0-I · Push 자료 고르기 — M
- [없음] 시트 상단 '마이 › 서류'·'홈 › 북마크 공고' 다중 선택 목록("PDF · 2.4MB · 10월 12일", "서울 강남구 · 경력 4–6년 · D-13")과 '2개 추가' 버튼. 앱 '자료 고르기' 시트에는 '다른 곳에서' 파일 · GitHub 링크 · 공고 붙여넣기만 있어요(`features/chat/components/composer-area.tsx:99-135`).
- [OK] 제목 '자료 고르기', '다른 곳에서' 3행 (`features/chat/components/composer-area.tsx:102`, `:119-133`)

### 에이전트 Flow › Phase 0-I → 1 · 분석 시작 확인 — M
- [문구] 질문: 디자인 "이대로 분석을 시작할까요?" vs 서버 "입력한 자료를 확인했어요. 분석을 시작할까요?" ([BE] `be:harness/personal/resume/graph.py:80`)
- [BE] '입력 정리' 카드(이력서 / 공고 / GitHub / 말투 행)와 요약 "이력서만 · 자료 3개 · 말투 그대로". 서버가 요약을 보내지 않아요(C3 또는 섹션 이벤트).
- [OK] 네, 시작해 주세요 / 자료를 바꿀래요 / 그만할게요 (`be:harness/personal/resume/graph.py:82-85`, `:608`)
- [추가] 추천 배지(C2), [없음] 안내 문구(C1)

### 에이전트 Flow › Phase 1 · 입력 분석 중 — M
- [BE] 이 단계 할 일 목록(이력서 읽기 · GitHub 살펴보기 · 공고 분석 · 적합도 계산)(C4)
- [BE] 도구 줄 대상·결과("저장소 12개 중 공고 관련 3개" + "+3줄")(C3)
- [BE] 발견 문장 "이력서에 없는 저장소 **payment-retry-lab**을 찾았어요…": 인라인 강조는 `**`로 보내면 앱이 처리해요(`features/chat/components/items.tsx:19-34`).
- [OK] 상태 줄 "훑어보는 중… 21초 중지" 구조 (`features/chat/components/status-row.tsx`)

### 에이전트 Flow › Phase 1 → 2 · 적합도 확인 (PRO) — M
- [BE] 적합도 카드 전체(C5): 항목 5개, 키워드 칩(Kotlin/Spring Boot/JPA/Kafka/정산 도메인), "6.9점", "보통 · 개선 여지 있어요", "5개 항목 · 가중치 반영", 요약, PRO 티저 "이렇게 고치면 N점대 · ULTRA"
- [상태] 앱 `FitCard`는 3행 고정이고 별점·"/ 10"을 그려요(`features/chat/components/items.tsx:308-370`, `features/chat/constants.ts:28-32`). 디자인에 별점은 없어요.
- [OK] 질문·옵션 3개, 그만하기 없음 (`be:harness/personal/resume/graph.py:87-95`, `:604`)
- [추가] 추천 배지(C2), [없음] 안내 문구(C1)

### 에이전트 Flow › Phase 1 → 2 · 적합도 확인 · FREE — M
- [BE]/[없음] FREE는 항목 막대를 잠그고 "PRO로 올리면 항목별 점수와 약점을 볼 수 있어요"를 보여 줘요. 요금제별 노출 규칙이 앱과 서버 어디에도 없어요(C5).

### 에이전트 Flow › Phase 1 → 2 · 적합도 확인 · ULTRA — M
- [BE]/[없음] ULTRA는 "이렇게 고치면 8점대" 행을 보여 줘요(예상 점수 필드, C5).

### 에이전트 Flow › Phase 1 → 2 · 적합도 확인 · ULTRA · 펼침 — M
- [BE]/[없음] 펼치면 개선 목록 3줄("• 승인 API 성과를 숫자로 보여 주기" …). 펼침 동작과 목록 필드가 모두 없어요(C5).

### 에이전트 Flow › 피드백 확인 — M
- [BE] '피드백 정리 · 공고 요건 ↔ 내 이력서 · 고칠 점 3개' 카드(키워드/도메인/성과 행: 문제 + 고칠 방법). 서버는 `analysis.message` 텍스트만 보내요(`be:harness/personal/resume/graph.py:585-591`). 앱에 맞는 항목 유형이 없어요(`Plan`과 비슷함, `features/chat/components/items.tsx:212-243`).
- [OK] "피드백을 반영해서 수정할까요?" / 반영해서 수정할게요 / 그만하기 (`be:harness/personal/resume/graph.py:96-100`)
- [없음] 안내 문구(C1)

### 에이전트 Flow › Phase 2 · 수정 전략 — M
- [BE] '수정 전략 · 섹션 5개' 카드(강화/수정/추가/축소 태그 + 섹션 + 메모, 키워드 '+ 결제 승인' 등). 앱 `Plan` 항목이 정확히 이 모양이지만(`features/chat/components/items.tsx:212-243`, `features/chat/types.ts:19`) 스트림 이벤트가 없어요(`StreamEvent`에 plan 없음).
- [OK] "이 전략대로 초안을 쓸까요?" / 초안 쓸게요 / 피드백만 볼게요 / 그만하기 (`be:harness/personal/resume/graph.py:101-108`)
- [추가] C2, [없음] C1

### 에이전트 Flow › Phase 2-X · 경험 만들기 · 접근 — S
- [OK] 상세 "공고에 필요한 경험을 만들 방향을 골라 주세요."(detail) + 병목을 만들게요 / 문제를 예방할게요 / 그만하기 (`be:harness/personal/resume/graph.py:129-136`)
- [BE] 도구 줄 "공고 분석 · 필수 스택 5개 · 서비스 도메인: 결제·정산"(C3)
- [추가] C2, [없음] C1

### 에이전트 Flow › Phase 2-X · 경험 만들기 · 병목 강도 — S
- [OK] 가벼운/중간/강한 제약으로 (`be:harness/personal/resume/graph.py:137-145`)
- [추가] C2, [없음] C1

### 에이전트 Flow › Phase 2-X · 경험 만들기 · 예방할 문제 — S
- [OK] 옵션 6개, 안내 "여러 개 고를 수 있어요" (`be:harness/personal/resume/graph.py:146-158`, `features/chat/utils/stream.ts:12`)
- [추가] 다중 선택 확인 버튼 '이대로 진행'(`features/chat/constants.ts:22`, `features/chat/utils/stream.ts:14`). 디자인 텍스트에는 버튼이 없어요(그만하기 + 안내만).
- [추가] '성능'에 추천 배지(C2)

### 에이전트 Flow › Phase 2-X · 프로젝트 기획서 고르기 — M
- [BE] 기획서 4개(이름 · 분류·스택 · 통과/조건부 배지)를 고를 수 있는 옵션으로 보내야 해요. 서버 projects 게이트에는 '기획만 볼게요' 하나뿐이에요(`be:harness/personal/resume/graph.py:159-163`). 앱 `Choice`는 `desc`·`badge`를 지원하지만(`features/chat/types.ts:67`) `StreamOption`은 `id/label`만 있어요(`packages/api-client/src/types.ts:243`).
- [BE] '방향 검증 · 5개 기준 · …모두 통과' 도구 줄(C3)
- [OK] "어떤 프로젝트를 구현할까요?" (`be:harness/personal/resume/graph.py:160`)

### 에이전트 Flow › Phase 3 · 초안 쓰는 중 — M
- [BE] 초안 실시간 미리보기 카드("이력서 초안 v1 · 김서준 · 백엔드 개발자 …" + 깜빡이는 커서): 앱 `Paper` 항목은 있지만(`features/chat/components/items.tsx:467-494`) 스트림 이벤트가 없어요.
- [BE] 섹션 할 일(요약/경력/프로젝트/기술 스택/학력)(C4), 도구 줄 "초안 쓰기 · 이력서 v1 · 경력"(C3), 상태 "끄적이는 중…"

### 에이전트 Flow › Phase 3 · 초안 검토 — M
- [BE] '초안 쓰기 · 이력서 v1 · 1쪽 · 섹션 5개 · 말투 그대로' 결과와 ✓/− 변경 요약 4줄(C3 확장)
- [OK] "첫 번째 초안(v1)이에요. 이대로 검토할까요?" / 검토할게요 / 그만하기 (`be:harness/personal/resume/graph.py:109-113`)
- [없음] C1

### 에이전트 Flow › Phase 3-C · 점수 올리기 — M
- [OK] "점수를 한 번 더 올릴까요?" / 한 번 더 올리기 / 여기서 멈추기 / 그만하기 (`be:harness/personal/resume/graph.py:169-175`)
- [BE] 회차 도구 줄 "점수 올리기 1회 · 키워드 밀도 · 6.9 → 7.8 · …"(C3)
- [BE] 합계 "적합도 6.9 → 8.3 (+1.4)": 앱 `FitCard`의 `from/delta`가 맞는 모양이에요(`features/chat/components/items.tsx:313-323`). 서버 fit 이벤트에 from/delta가 필요해요(C5).
- [없음] C1

### 에이전트 Flow › Phase 3-C · 점수 올리기 · 멈춤 — S
- [상태] 멈춘 뒤 메시지가 디자인 변수(`{{m.msg}}`)라 문구를 확인할 수 없어요. 나머지는 위 아트보드와 같아요(C3·C5).

### 에이전트 Flow › 이어서 작성 — S
- [OK] "이어서 작성할까요?" / 이어서 작성하기 / 그만하기 (`be:harness/personal/tools.py:330-334`)
- [BE] 상세 "작성 중인 이력서 초안(v1)이 있어요."(`detail`). 서버가 보내지 않아요(`be:harness/personal/tools.py:325-335`).
- [BE] 이전 도구 줄의 '확인 대기 중'·'멈춤' 상태 태그(C3)

### 에이전트 Flow › Phase 4-A · 품질 검사 — M
- [BE] 품질 검사 게이트가 서버에 없어요(`_GATES`에 quality 없음, `be:harness/personal/resume/graph.py:48-176`). review 직전 문구만 있어요(`:865`). 디자인은 아래 순서예요.
  - 도구 줄 '품질 검사 · 오타 · 문법 · 말투 · ATS · 바로 고친 것 2개 · 추천 3개'와 바로 고친 diff 2줄
  - 다중 선택 "추천 수정도 반영할까요?"(설명 있는 옵션)
  - 확인 버튼 "2개 반영하고 디자인으로"
- [상태] 앱 패널은 다중 선택 + 확인 버튼을 지원하지만(`features/chat/components/approval-panel.tsx:125-146`), 버튼 문구는 '이대로 진행' 고정이에요(`features/chat/utils/stream.ts:14`). 문구를 서버에서 받아야 해요.

### 에이전트 Flow › Phase 4-B · 템플릿 고르기 — M
- [OK] "검증을 마쳤어요. 어떤 디자인을 적용할까요?", 클래식(추천)/모던/컴팩트/ATS (`be:harness/personal/resume/graph.py:114-123`)
- [BE] 상세 "템플릿을 골라 주세요. 처음이라면 클래식을 추천해요." 미전송
- [상태] 디자인은 템플릿 미리보기 썸네일 4개예요. 앱에 `templates` 섹션 컴포넌트는 있지만(`features/chat/components/approval-panel.tsx:103-110`, `:266-290`) 스트림은 항상 `choices`라 번호 목록으로 나와요(`features/chat/utils/stream.ts:16-23`).
- [없음] '프로필 사진 넣기 · 마이 › 프로필 사진을 써요 · 모든 템플릿' 토글([BE] 게이트 옵션 필요)
- [없음] 확인 버튼 '클래식으로 만들기'. 앱은 번호를 누르면 바로 답해요(`features/chat/components/approval-panel.tsx:38-43`).

### 에이전트 Flow › Phase 5 · PDF 만들기 — S
- [OK] "Push 프로필에 저장하는 중…" 토큰 (`be:harness/personal/resume/graph.py:965`)
- [BE] '디자인 적용 · 모던 · A4 1쪽 · 여백과 줄 간격 맞춤', '프로필 사진 · 헤더 왼쪽 원형 80px', 'Push 프로필' 도구 줄(C3), 상태 "정리하는 중…"

### 에이전트 Flow › Phase 6 · 결과 확인 · 프로필 수정 — M
- [OK] "Push 프로필에 저장했어요. 결과를 확인할까요?" / 확인했어요 / 그만하기 (`be:harness/personal/resume/graph.py:124-128`)
- [상태] 안내 "PDF는 Push 프로필에서 내보낼 수 있어요.": 서버는 choice에 `note`를 보내지만(`be:harness/personal/resume/graph.py:622-624`) FE 타입에 `note`가 없어(`packages/api-client/src/types.ts:265`) `stream.ts:41`에서 버려요.
- [상태] 결과 카드: 디자인은 확인 전 '서준' 아바타 + "Push 프로필에 저장했어요" + 안내 + '프로필 보기'예요. 앱 결과 카드는 이름·헤드라인 제목과 '바로 지원'을 함께 보여 줘요(`features/chat/components/items.tsx:412-465`).
- [BE] 요약(C6). [추가] C2, [없음] C1

### 에이전트 Flow › Phase 6 · 결과 확인 · 외부 파일 — S
- [OK] 파일 카드 + "내 서류에 저장했어요. 결과를 확인할까요?" (`be:harness/personal/resume/graph.py:347`, `:618-619`)
- [BE] 요약(C6). [추가] C2, [없음] C1

### 에이전트 Flow › Phase 6 · 결과 확인 · 외부 파일 저장 실패 — S
- [OK] meta "A4 1쪽 · 186KB"만 있음 + "내 서류에 저장하지 못했어요. 결과를 확인할까요?" (`be:harness/personal/resume/graph.py:348`, `:541-546`)
- [BE] 요약(C6). [추가] C2, [없음] C1

### 에이전트 Flow › Phase 6 · 바로 지원 확인 — M
- [OK] 사용자 말풍선 "모아페이에 바로 지원해 줘" (`features/chat/components/items.tsx:563`), 질문 "이 공고에 지원해요", 실행/취소 (`be:harness/personal/tools.py:465`, `be:harness/approval.py:11-12`, `features/chat/utils/stream.ts:39`)
- [BE] 패널 안 도구 카드 "지원하기 · 모아페이 · 백엔드 엔지니어 · 확인을 기다리는 중"(대상 + wait 상태, C3)
- [BE] 안내 "지원하면 취소할 수 없어요": RISKY_WRITE 승인에 `foot`(경고 문구)이 필요해요. 앱은 `approval` 이벤트의 foot을 매핑하지 않아요(`features/chat/utils/stream.ts:39`).

### 에이전트 Flow › 예외 · 읽기 실패와 재시도 — M
- [BE] 실패·재시도 도구 줄: "시간이 오래 걸려서 한 번 더 시도했어요 · 저장소 3개만 읽었어요", "“자격 요건”을 읽지 못했어요 · 로그인이 필요한 영역이에요"(err 상태 + 이유, C3). 서버에 해당 문구가 없어요(services/ai grep 0건).
- [BE] 선택 "어떻게 할까요?" + 상세 + 공고 내용을 붙여넣을게요 / 이대로 진행해 주세요 / Push 공고에서 고를게요. 서버에 이 choice가 없어요. 앱은 제목 기본값 "어떻게 할까요?"(`features/chat/constants.ts:21`)와 `detail`(`features/chat/utils/stream.ts:41`)을 이미 지원해요.
- [상태] 도구 줄 `error`는 빨간 글자 한 줄로만 그려요(`features/chat/components/items.tsx:111-116`). 디자인은 재시도 경고(주황)와 실패를 구분해요.

### 에이전트 Flow › 예외 · 검증 실패 — S
- [OK] "검증을 통과하지 못했어요. 다른 방향으로 다시 고를까요?" / 다시 고르기 / 그만하기 (`be:harness/personal/resume/graph.py:164-168`)
- [추가] '다시 고르기'에 추천 배지(C2). 이 화면 디자인에는 안내 문구도 없어서 C1은 해당 없어요.

### 에이전트 Flow › 에이전트 · 인터랙티브 프로토타입 — S
- [OK] 도구 줄 깜빡임→초록, +N줄 접기, 상태 줄, 할 일 체크, diff, 승인 패널, 중단 문구, @언급 동작이 앱에 있어요(`features/chat/components/items.tsx`, `status-row.tsx`, `approval-panel.tsx`, `composer-area.tsx`).
- [문구] 프로토타입의 문서 수정 승인("경력 섹션을 이렇게 바꿀까요? / 네, 반영해 주세요 / 네, 이번 대화에선 묻지 않기 / 아니요, 다르게 해 주세요 / 직접 말하기")은 서버 현재 문구("이 수정을 적용할까요? / 적용 / 그대로 두기", `be:harness/personal/tools.py:257-262`) 및 05 '변경 확인' 아트보드와 달라요. 05가 서버와 같아서 프로토타입이 옛 문구로 보여요(판단 필요).
- [BE] '네, 이번 대화에선 묻지 않기'(대화 단위 자동 승인)는 서버 옵션에 없어요.

### 에이전트 Flow › 에이전트 · 모션 — S
- [OK] 기호 1.1s·6프레임(`features/chat/components/items.tsx:496-512`), 동사 2.5s 교체(`features/chat/components/status-row.tsx:27`), 완료 300ms 팝(`items.tsx:90`), diff 줄 300ms·150ms 간격(`items.tsx:253-258`), 승인 패널 420ms·cubic-bezier(.2,.9,.25,1)(`approval-panel.tsx:31-33`, `constants.ts:7`), 선택 150ms(`approval-panel.tsx:41-42`), 햅틱(승인 light·완료 success·오류/중단 warning, `stores.ts:97-99`, `:230`), 동작 줄이기, '↓ 새 내용' 버튼(`screens/chat/conversation-screen.tsx:107-108`, `:130-143`)
- [상태] 시머 2s linear 그라데이션 대신 투명도 깜빡임으로 대신해요(`features/chat/components/status-row.tsx:11-13` shortcut 주석).
- [상태] 할 일 체크 350ms 오버슛은 있지만(`usePop`) 취소선이 왼쪽에서 그어지는 350ms 애니메이션은 없어요(`textDecorationLine` 즉시, `features/chat/components/items.tsx:180`).
- [상태] 메시지 보내기 말풍선 400ms·scale .94→1 (`features/chat/constants.ts:8`, `components/motion.tsx`)은 코드상 있어요(렌더 검증 안 함).

---

## 요약

| 페이지 | 아트보드 | OK | S | M | L |
|---|---|---|---|---|---|
| 05 에이전트 | 21 | 7 | 7 | 6 | 1 |
| 06 에이전트 프로필 | 1 | 0 | 0 | 1 | 0 |
| 07 에이전트 외부 서류 | 3 | 0 | 1 | 2 | 0 |
| 08 에이전트 사이드바 | 16 | 3 | 7 | 6 | 0 |
| 09 에이전트 빠른 시작 | 13 | 1 | 2 | 10 | 0 |
| 10 에이전트 Flow | 31 | 0 | 12 | 18 | 1 |
| **합계** | **85** | **11** | **29** | **43** | **2** |

### [BE] 항목 (스트림 이벤트·필드 / API)
1. **할 일 개수(공고 없음)**: 외부 파일 + 공고 없음일 때 4단계(이력서 읽기 · 고칠 점 찾기 · 경력 섹션 고치기 · PDF로 만들기)를 보내야 해요. 지금은 항상 `_FILE_STEPS` 5개예요(`be:harness/personal/resume/graph.py:353-359`, `:536`, `:961`).
2. `tool` 이벤트에 `target`·`resultLine`·`extra[]`가 필요해요. 경고·재시도 상태도 필요해요(C3).
3. `todo`를 단계마다 now/done으로 보내고 `added` 필드를 넣어야 해요. 지금은 present에서 전부 done으로 한 번만 보내요(C4).
4. `fit` 이벤트를 채팅에서 보내야 해요(지금 0건). 항목 5개, keywords `{label, ok}`, band, summary, from/delta, 예상 점수 + 개선 목록, 요금제별 노출이 필요해요(C5).
5. `result`(또는 별도 이벤트)에 요약 `fitFrom/fitTo/bullets[]`가 필요해요. 공고 없음이면 "이력서를 고쳤어요"예요(C6).
6. 문서 수정 승인 **전에** 미리보기 diff를 보내야 해요. 지금은 적용 후에 보내요(`be:harness/personal/tools.py:290`).
7. `think`(생각함 · n초), `plan`(수정 전략), `paper`(초안 실시간), 피드백 카드 이벤트가 필요해요. 앱 컴포넌트는 plan·paper·think 모두 있어요.
8. 다중 섹션 choice: 산출물 칩 + 가져올 자료 행 + 말투 칩(10-02), 템플릿 썸네일 + 프로필 사진 토글 + 확인 버튼 문구(10-22)가 필요해요. `StreamOption`에 `desc`·`badge` 필드도 필요해요(10-15 기획서 4개).
9. 게이트 문구와 누락 게이트:
   - intake 제목을 "이대로 분석을 시작할까요?"로 바꾸기(`be:…/graph.py:80`)
   - review·이어서 작성의 `detail` 보내기
   - 품질 검사 게이트 추가("추천 수정도 반영할까요?" + "2개 반영하고 디자인으로")
   - 읽기 실패 choice 추가(공고 내용을 붙여넣을게요 / 이대로 진행해 주세요 / Push 공고에서 고를게요)
   - RISKY_WRITE 승인 경고 foot "지원하면 취소할 수 없어요"
10. `file` 이벤트에 `meta`("A4 1쪽 · 186KB")가 필요해요.
11. `GET /conversations` 행에 `status`(NEEDS_APPROVAL/RUNNING)와 `lastLine`이 필요해요(push-be grep 0건).
12. 대화 메시지 API가 카드 이벤트(todo/tool/diff/result)를 저장하거나 다시 보내야 해요(C7).
13. 빠른 시작 데이터 API가 필요해요: 매칭 조건 칩, 최근 본 공고, 공고별 서류 상태, 이번 주 캘린더 일정, 갭 분석 추천 경험, 허브 추천 사람, 커리어 글 추천 주제.
14. '네, 이번 대화에선 묻지 않기' 대화 단위 자동 승인 옵션(프로토타입에만 있어서 판단 필요)

### [네이티브] 항목
1. 하단 탭 바: NativeTabs로 이미 네이티브예요 ✓ (`app/(tabs)/_layout.tsx:6`)
2. 대화 '더 보기' 메뉴: 디자인은 iOS UIMenu 풀다운 / Android 드롭다운이에요. 앱은 JS Modal + Glass예요(`screens/chat/conversation-screen.tsx:226-266`).
3. 대화 길게 누름: 디자인은 iOS 컨텍스트 메뉴(행 미리보기) / Android 팝업 메뉴예요. 앱은 `Alert.alert`예요(`features/chat/components/conversations-modal.tsx:80-88`). **L**
4. 내 링크 ⋯ 메뉴: 디자인은 팝오버 메뉴예요. 앱은 JS BottomSheet예요(`features/chat/components/links-modal.tsx:124-142`).
5. 링크 삭제 되돌리기: 디자인은 토스트 / Android Snackbar예요. 앱은 두 번째 Alert예요(`features/chat/components/links-modal.tsx:85-88`).
6. 바텀 시트(실행 방식·동의·빠른 시작·자료 고르기·계정 picker): 디자인은 grabber 시트(iOS detent)예요. 앱은 전부 JS `BottomSheet`(Modal)예요(`shared/components/bottom-sheet.tsx:20`).
7. 세그먼트(북마크/최근 본 공고, 진행 중/전체, 팔로잉/허브 추천): 앱 `SegmentedControl`은 JS예요(`shared/components/segmented-control.tsx`). 지금은 데이터가 없어 그려지지도 않아요.
8. 이미 네이티브 ✓: 삭제 확인 Alert(`features/chat/components/conversations-modal.tsx:65-78`), 링크 삭제 확인 Alert, 7점 필터 RN `Switch`(`shared/components/switch.tsx:7`), 대화 목록·계정·내 서류·북마크·내 링크 pageSheet(`features/chat/components/page-modal.tsx:28`, `conversations-modal.tsx:181`), 입력창·상태 줄·승인 패널 iOS Glass(expo-glass-effect)
