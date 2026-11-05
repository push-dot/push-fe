# FE-C / FE-W / FE-D / FE-X — implementation tasks

Sources: push-fe `origin/design/handoff-2026-11-05` `docs/design-handoff/STATUS.md`, `gaps/g2-agent.md`, `gaps/g4-web.md`, `gaps/_native-api.md`. Heads: `feat/agent-design` @9a93928 (PR #142), `feat/web-design` @ecf564b, `feat/design-system` @b469d75 (PR #144), `fix/app-bugs-gate` (PR #145). File pointers: `/Volumes/Untitled/scratch/tasks/notes-c-w.md`.

`/Volumes/Untitled/scratch/stream-v3-spec.md` was not on disk. FE-C-11 describes the dependency. If that file appears, its event shapes replace the shapes in FE-C-11.

Notes point 5 is stale on `feat/agent-design`: `packages/api-client/src/types.ts` choice event already has `note?: string`. `mapEvent` `case 'choice'` still drops it (it passes `detail` only). Do not remove `note`.

Native API (PR #143, already merged into #142 and #144): `Menu` / `ContextMenu` child must be a plain `View`. It cannot wrap `Pressable` or `GlassButton`. No `Menu` / `ContextMenu` / `showToast` call site exists yet. `showToast` inside a page sheet needs its own `<ToastHost />` in that sheet. Integrate with `git merge`. Do not force-push.

g2 large-text min heights are FE-D-03, not a separate C task.

## FE-D-01 tab bar colours
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/design-system` (PR #144) + `feat/design-system-tab-colors`
- Depends on: none (#144 tokens already on the branch)
- Files: `apps/fo-mobile/src/app/(tabs)/_layout.tsx`
- Design: canvas audit 2026-10 on every Push 앱 page (tab bar). No single artboard.
- Logic design: `NativeTabs` icon and label colours, both states. iOS idle `t1`, selected `acText`. Android idle `t3`, selected `t1`. Use the theme palette from `@push/design-system` (same values `useColors()` already exposes). Do not change tab labels, icons, or `minimizeBehavior`. Primary-button glow: no change.
- Tests: `apps/fo-mobile/src/app/(tabs)/tab-colors.test.ts` — `ios tab colors`, `android tab colors`. Assert the idle/selected pairs above. A pure function of `(platform, selected) => color` is enough to test; the layout calls it.
- Done when: `pnpm --filter fo-mobile test -- src/app/(tabs)/tab-colors.test.ts` passes. iOS selected label/icon is `acText`; Android selected is `t1`.

## FE-D-02 selected ring
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/design-system` + `feat/design-system-selected-ring` (stack on FE-D-01)
- Depends on: FE-D-01
- Files: `apps/fo-mobile/src/features/chat/components/approval-panel.tsx` (choice rows and template cards), `apps/fo-mobile/src/features/chat/components/quick-start-sheet.tsx` (option cards; STATUS cites ~372 and ~437), `apps/fo-mobile/src/screens/my/settings-screen.tsx` (selected row ~74 already fills `acSoft`, add the ring), `apps/fo-mobile/src/features/jobs/components/filter-row.tsx` (selected row already fills `acSoft`, add the ring)
- Design: canvas audit 2026-10 selected chip. One style everywhere.
- Logic design: selected state only: background `acSoft`, plus a 1.5px inset ring in `ac` (`borderWidth: 1.5`, `borderColor: ac`). Inset means the ring does not grow the layout. Unselected rows stay as they are. Do not change what "selected" means.
- Tests: `apps/fo-mobile/src/theme/selected-ring.test.ts` — `selected ring style`. Assert `{ backgroundColor: acSoft, borderWidth: 1.5, borderColor: ac }` from a shared style helper. Each file imports that helper. No second copy of the numbers.
- Done when: the test passes. Selected choice row, template card, quick-start option, settings row, and filter row all use the helper.

## FE-D-03 48px targets and large text
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/design-system` + `feat/design-system-hit-targets` (stack on FE-D-02)
- Depends on: FE-D-02
- Files: `apps/fo-mobile/src/shared/components/chip.tsx` (height 34), `apps/fo-mobile/src/features/chat/components/approval-panel.tsx` (MiniChip height 28 ~256), `apps/fo-mobile/src/features/chat/components/composer-body.tsx` (40px rounds at ~30 and the mode pill at ~65), `apps/fo-mobile/src/features/chat/components/mode-picker.tsx` (~19, height 40), `apps/fo-mobile/src/features/social/components/comment-composer.tsx` (~50, 40px send), `apps/fo-mobile/src/features/chat/components/status-row.tsx` (row height 36 iOS / 28 Android at ~33; stop `Pressable`)
- Design: canvas audit 2026-10 48px hit area. Also g2 `에이전트 › 에이전트 · 큰 글씨` (lines grow, they do not clip).
- Logic design: Replace fixed `height` with `minHeight`. Floor is 48 for Chip, MiniChip, composer round buttons, mode pill, comment send, and the stop control. Status row keeps its visual min (36 iOS / 28 Android) but must be `minHeight`, not `height`, so the verb can grow. Stop control's own box is at least 48. Do not change colours. This task closes the g2 large-text item; do not repeat it on `feat/agent-design`.
- Tests: `apps/fo-mobile/src/shared/components/hit-target.test.ts` — `hit target is at least 48`, `status row uses minHeight`. Assert the exported size constants.
- Done when: test passes. No fixed `height: 34`, `height: 28`, or `height: 40` left on those controls. Status row has no fixed `height`.

## FE-D-04 fo-web equivalents
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/design-system` + `feat/design-system-web-audit` (stack on FE-D-03). fo-web CSS lives on this branch.
- Depends on: FE-D-01, FE-D-02, FE-D-03
- Files: `apps/fo-web/src/styles.css` (append; do not edit the token block #139 touched, ~42–90). Nav rules are `.browser .nav a` (~355) and `.browser .nav a.on` (~356).
- Design: no fo-web artboard. Same audit rules as FE-D-01–03, web shell only.
- Logic design: Browser nav is the tab-bar equivalent (one platform). Idle link colour `var(--t1)` (today `t2`). Selected link colour `var(--acText)`, background `var(--acSoft)`, `box-shadow: inset 0 0 0 1.5px var(--ac)`. Nav link `min-height: 48px` (today height 40). Filter chips and the apply-sheet selected radio use the same inset ring when selected. Do not change the in-app WebView pages in this task (FE-X-01). Do not set `data-theme` on `.browser` (it stays `light`).
- Tests: `apps/fo-web/src/app/audit-rules.test.ts` — `nav idle is t1`, `nav selected is acText with inset ring`, `nav min height 48`. Read the CSS text and assert those declarations exist.
- Done when: `pnpm --filter fo-web test -- src/app/audit-rules.test.ts` passes. Shell nav shows the new colours. WebView pages are untouched.

## FE-C-01 agent S copy and empty states
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/agent-design` (PR #142) + `feat/agent-s-copy`
- Depends on: none
- Files: `apps/fo-mobile/src/features/chat/constants.ts`, `apps/fo-mobile/src/features/chat/api/hooks.ts` (mention subs only), `apps/fo-mobile/src/features/chat/components/account-modal.tsx`, `apps/fo-mobile/src/features/chat/components/docs-modal.tsx`, `apps/fo-mobile/src/features/chat/components/links-modal.tsx`, `apps/fo-mobile/src/features/chat/components/bookmarks-modal.tsx`, `apps/fo-mobile/src/features/chat/components/conversations-modal.tsx` (empty state only)
- Design: g2 artboards listed in Logic design. Copy is verbatim from `gaps/g2-agent.md`.
- Logic design: Replace these strings and nothing nearby.
  - `ACCESS_MODE_TITLE`: `에이전트가 어떻게 실행할까요?` (artboard `에이전트 › 에이전트 · 실행 방식 시트`). Option titles stay.
  - `CONSENT_TITLE`: `에이전트를 쓰려면\n동의가 필요해요`. `CONSENT_BODY`: `내 서류와 평가 결과를 가공해 다른 사용자와 기업의 에이전트가 참고 자료로 써요.` (`에이전트 › 에이전트 · 참고 데이터 동의`).
  - Doc sub when `aiMade`: `에이전트로 만듦 · ${ago}` in both `hooks.ts` and `docs-modal.tsx`. Non-AI sub stays. (`에이전트 › 에이전트 · @언급 · 처음`, `에이전트 사이드바 › 에이전트 · 내 서류 모달 (#6)`).
  - Link mention sub: `${kindLabel} · ${bareUrl}` using the existing `KINDS` labels (`공고`, `GitHub`, `포트폴리오`, `블로그`, `기타`). Example `공고 · careers.moapay.kr/jobs/1182`.
  - Unfiltered @mention `바로가기` group: only quick-start keys `link`, `gap`, `fit` (labels `공고 링크로 맞추기`, `부족한 점 찾기`, `적합도 보기`). A typed filter still hides shortcuts.
  - Account group title `에이전트가 참고하는 내 정보`. Note `대화를 시작할 때 에이전트가 이 정보부터 읽어요.` (`에이전트 사이드바 › 에이전트 · 계정 프로필`).
  - Plan sheet header `요금제마다\n쓸 수 있는 양이 달라요`. Footer two lines: `매월 1일에 사용량이 다시 채워져요.` and `언제든 해지할 수 있어요`. Remove `매달 결제돼요 · 언제든 해지할 수 있어요` and remove the design header from the footer. Same header/footer on the ULTRA page. Do not add `요금제 낮추기`. Do not remove `구매 복원`. (`에이전트 사이드바 › 에이전트 · 계정 모달 › 요금제`, `에이전트 사이드바 › 요금제 · ULTRA 사용 중`).
  - Link add: `추가하면 에이전트가 README와 커밋을 읽어 둬요`.
  - Link empty: only `아직 모아 둔 링크가 없어요.` plus the existing `링크 추가` button. Remove the extra paragraph, 3D icon, and the four kind chips from the empty state. (`에이전트 사이드바 › 에이전트 · 내 링크 · 빈 상태`).
  - Link delete body (confirm title stays `이 링크를 삭제할까요?`): `${title} 링크를 내 링크에서 지워요.` Example `모아페이 · 결제 플랫폼 시니어 엔지니어 링크를 내 링크에서 지워요.` (`에이전트 사이드바 › 에이전트 · 내 링크 · 삭제 확인`). The undo toast is FE-C-06, not this task.
  - Bookmark empty: `북마크한 공고가 없어요.` Button `채용공고 보기` does `router.push('/jobs')`. When the list is empty, hide the filter chips and the helper line. (`에이전트 사이드바 › 에이전트 · 북마크한 공고 모달 (#14, 빈 상태)`).
  - Conversation empty: keep `아직 대화가 없어요` and `새 대화 시작`. Hide the `보관한 대화` row when there are zero conversations. (`에이전트 › 에이전트 · 대화 목록 · 빈 상태`).
  - Do not change heights (FE-D-03). Do not change menus (FE-C-04–06).
- Tests: `apps/fo-mobile/src/features/chat/__tests__/s-copy.test.ts` — `access mode title`, `consent title and body`, `plan header and footer`, `link delete body`, `mention shortcuts are three`. Update any existing assertion that still expects the old `AI` strings.
- Done when: `pnpm --filter fo-mobile test -- src/features/chat/__tests__/s-copy.test.ts` passes. The strings above are the ones on screen.

## FE-C-02 real-mode doc sub line
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-doc-origin` (merge into #142)
- Depends on: FE-C-01
- Files: `apps/fo-mobile/src/features/chat/api/fetchers.ts` (`realDocs`), `apps/fo-mobile/src/features/chat/api/schemas.ts` (`ChatDoc.aiMade` already optional)
- Design: `에이전트 › 에이전트 · @언급 · 처음`
- Logic design: `realDocs` today drops `SourceItem.origin`. Set `aiMade: s.origin === 'AI'` (same check fo-web apply sheet uses). Mock `chat/docs` already returns `aiMade`; do not change the mock. `createdAt` null becomes `new Date().toISOString()` as today. No new endpoint.
- Tests: `apps/fo-mobile/src/features/chat/__tests__/docs-origin.test.ts` — `AI origin sets aiMade`, `other origin does not`. Call the mapper with `{ origin: 'AI' }` and `{ origin: 'UPLOAD' }`.
- Done when: test passes. A real-mode doc with `origin: 'AI'` renders `에이전트로 만듦 · …`.

## FE-C-03 10-24 card markup
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/agent-design` + `feat/agent-profile-save-card`
- Depends on: none
- Files: `apps/fo-mobile/src/features/chat/components/items.tsx` (`ResultCard`), `apps/fo-mobile/src/features/chat/utils/result-card.ts`
- Design: `에이전트 Flow › Phase 6 · 결과 확인 · 프로필 수정` (10-24 pre-confirm)
- Logic design: Add an optional prop `pendingNote?: string` on the profile result card. When it is set: initials avatar (existing `resultChrome`), title exactly `Push 프로필에 저장했어요`, body is `pendingNote`, one button `프로필 보기` (existing view handler). Hide `바로 지원` and the name/headline title. When `pendingNote` is absent, the card stays as it is. This task does not read the stream. FE-C-09 passes the prop. No new component.
- Tests: `apps/fo-mobile/src/features/chat/__tests__/result-card.test.ts` — add `pre-confirm profile card`. Assert title `Push 프로필에 저장했어요`, body equals the note, button labels are only `프로필 보기`. Existing result-card tests stay green.
- Done when: that test passes. Passing `pendingNote` changes the card; omitting it does not.

## FE-C-04 conversation header menu
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-conversation-menu`
- Depends on: none (#143 is already in #142)
- Files: `apps/fo-mobile/src/screens/chat/conversation-screen.tsx` (JS `MoreMenu` ~77–91 and ~226–266), `apps/fo-mobile/src/features/chat/utils/conversation-menu.ts`, `apps/fo-mobile/src/shared/components` (`Menu` from PR #143)
- Design: `에이전트 › 에이전트 · 대화 더 보기`
- Logic design: Delete the JS `MoreMenu` modal. The `⋯` control is a `Menu`. Its child is a plain `View` with the more icon. Do not wrap `GlassButton` (it renders `Pressable`). Keep `새 대화` as its own `GlassButton` beside the menu, not inside it. Action order, labels exact: `이름 바꾸기`, `쓴 서류·공고 보기`, `대화 공유`, `고정` (label `고정 해제` when `conv.pinned`), `보관`, `대화 삭제` (`destructive: true`, separator above). Wire `이름 바꾸기` to the existing rename sheet (`대화 이름을 바꿀까요?`, max 300, button `이름 바꾸기`, `useRenameConversation`). Docs and share stay. `고정` calls `usePinConversation`. `보관` calls `useArchiveConversation`, then `router.dismissTo('/chat')`. Delete stays the existing `Alert`. Export the six labels from `conversation-menu.ts` so the test can see the order. No `systemImage`.
- Tests: `apps/fo-mobile/src/features/chat/__tests__/conversation-menu.test.ts` — `header menu order`. Assert the six labels and that pinned swaps only the fourth label to `고정 해제`.
- Done when: test passes. The header `⋯` opens a native menu with those six actions. No JS modal remains for it.

## FE-C-05 conversation long-press menu
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-conversation-context` (stack on FE-C-04)
- Depends on: FE-C-04
- Files: `apps/fo-mobile/src/features/chat/components/conversations-modal.tsx` (~80–88 `Alert.alert`), `apps/fo-mobile/src/features/chat/utils/conversation-menu.ts`
- Design: `에이전트 › 에이전트 · 대화 목록 · 길게 누름`
- Logic design: Replace the long-press `Alert` with `ContextMenu`. The row is not its own `Pressable`. `onPress` opens the conversation (today's tap). Actions, in order: `이름 바꾸기`, `고정` or `고정 해제`, `보관`, `삭제` (`destructive`). `이름 바꾸기` opens the same rename sheet FE-C-04 uses (same title, max 300, same mutation). Pin, archive, delete call the hooks already in this file. `preview` is the row (title, last line, time) and is iOS-only; pass it and let the primitive no-op on Android. Do not show this menu on the archived list. Update `conversationRowMenu` to this four-item list (callers: this file only).
- Tests: extend `conversation-menu.test.ts` — `context menu includes rename`. Labels `['이름 바꾸기', '고정', '보관', '삭제']`, and pinned second label `고정 해제`.
- Done when: test passes. Long-press no longer calls `Alert.alert` for the row menu. Delete confirm `Alert` stays.

## FE-C-06 link menu and undo toast
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-link-menu`
- Depends on: FE-C-01
- Files: `apps/fo-mobile/src/features/chat/components/links-modal.tsx` (BottomSheet menu and the second `Alert` after delete)
- Design: `에이전트 사이드바 › 에이전트 · 내 링크 · 더 보기 메뉴`, `에이전트 사이드바 › 에이전트 · 내 링크 · 삭제 확인`
- Logic design: Replace the link `BottomSheet` with `Menu` on the `⋯` icon. Child is a plain `View`, not `Pressable`. Actions stay `열기`, `링크 복사`, `에이전트에서 쓰기`, `삭제` (`destructive`). `링크 복사` keeps `shareMessage` (no clipboard module; do not add one). Confirm delete still uses `Alert` with the FE-C-01 body. On success do not open a second `Alert`. Call `showToast({ message: '링크를 삭제했어요', action: { label: '되돌리기', onPress } })`. `onPress` calls the existing restore mutation (`useAddLink` with the same url, kind, `aiRead: true`). Mount `<ToastHost />` inside `LinksModal` (it is a page sheet; the root host is not visible there).
- Tests: `apps/fo-mobile/src/features/chat/__tests__/link-delete.test.ts` — `undo toast payload`. Assert message `링크를 삭제했어요` and action label `되돌리기`. Assert the confirm body helper from FE-C-01.
- Done when: test passes. Delete shows one confirm alert, then a toast with `되돌리기`. No second alert.

## FE-C-07 native sheet routes
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-native-sheets`
- Depends on: none. Do not restyle cards; keep FE-D-02 ring and FE-D-03 `minHeight` if those files already have them.
- Files: `apps/fo-mobile/src/app/_layout.tsx`, new `apps/fo-mobile/src/app/consent.tsx`, new `apps/fo-mobile/src/app/quick-start/[key].tsx`, new `apps/fo-mobile/src/app/materials.tsx`, `apps/fo-mobile/src/features/chat/components/consent-sheet.tsx`, `apps/fo-mobile/src/features/chat/components/quick-start-sheet.tsx`, `apps/fo-mobile/src/features/chat/components/composer-area.tsx` (~99–135), `apps/fo-mobile/src/features/chat/stores.ts`, `apps/fo-mobile/src/shared/navigation/sheet-options.ts`
- Design: `에이전트 › 에이전트 · 참고 데이터 동의`; `빠른 시작 › 빠른 시작 · 공고 링크로 맞추기` (same shell for every quick-start key); `에이전트 Flow › Phase 0-I · 산출물과 자료 확인` materials sheet (`자료 고르기`). `실행 방식` already routes to `/access-mode`. Do not add a second route for it.
- Logic design: Register each screen with `sheetOptions`. Wrap the screen in `<Sheet>`.
  - Consent: `router.push('/consent')` where `useConsentPrompt.open` is set today. `router.back()` sets `dismissed`. Detent `fitToContents`. Copy comes from FE-C-01 constants. Remove the JS `BottomSheet` from `consent-sheet.tsx`.
  - Quick start: `router.push(`/quick-start/${key}`)` with the existing key. Detents `[0.5, 1]` and a `ScrollView` (the sheets are long). The screen renders the current `quick-start-sheet` body for that key. Close is `router.back()`. This replaces the modal that iOS dropped from the a11y tree. Do not delete `notScreenSized` in `bottom-sheet.tsx`; other sheets still need it.
  - Materials: payload lives on a zustand slice in `stores.ts` (`kind: null | 'github' | 'posting'`, `text: string`). Composer `+` does `router.push('/materials')`. Same three rows: `파일`, `GitHub 링크`, `공고 붙여넣기`. File pick stays in the composer callback (it already calls `attachFile`). URL submit writes the text back through the store and `router.back()`. Detent `fitToContents`. Title `자료 고르기`. Remove the `BottomSheet` from `composer-area.tsx`.
  - Account pickers are FE-C-08. Do not route them.
- Tests: `apps/fo-mobile/src/shared/navigation/sheet-options.test.ts` already covers detents. Add `apps/fo-mobile/src/features/chat/__tests__/sheet-routes.test.ts` — `consent path`, `quick start path`, `materials path`. Assert the route strings `/consent`, `/quick-start/link`, `/materials`.
- Done when: those tests pass. Consent, quick start, and materials open as form sheets. Composer has no materials `BottomSheet`. `/access-mode` still works.

## FE-C-08 account inline menus
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-account-menus`
- Depends on: FE-C-01 (title string), FE-C-07 (do not also route these)
- Files: `apps/fo-mobile/src/features/chat/components/account-modal.tsx` (picker `BottomSheet` ~136–151; rows ~115–127)
- Design: `에이전트 사이드바 › 에이전트 · 계정 프로필`
- Logic design: The account UI is already a page sheet. A second sheet is the wrong fix. `말투` and `실행 방식` become inline `Menu`s. Child is a plain `View` that looks like the current row (label, current value, chevron). Do not wrap a `Pressable` row. `말투` actions are the existing `TONES` labels; `selected: true` on the current one; `onPress` calls the existing `save.mutate({ defaultTone })`. `실행 방식` actions are `ACCESS_MODES` labels; `selected` on the current mode; `onPress` calls `access.pick`. Menu title is not shown (inline menu). The row label for 실행 방식 stays the current value plus `mode.desc` (do not rename the row to `실행 방식`). `작업 강도` and `대화 기록 보관` stay on the existing `BottomSheet`. Do not remove those rows.
- Tests: `apps/fo-mobile/src/features/chat/__tests__/account-menus.test.ts` — `tone menu selects current`, `access menu selects current`. Assert the action labels and which index is `selected`.
- Done when: test passes. `말투` and `실행 방식` open a native menu inside the account sheet. They do not call `router.push`.

## FE-C-09 10-24 card state
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-profile-save-state` (stack on FE-C-03)
- Depends on: FE-C-03
- Files: `apps/fo-mobile/src/features/chat/utils/stream.ts` (`case 'choice'`), `apps/fo-mobile/src/features/chat/utils/reducer.ts`, `apps/fo-mobile/src/features/chat/components/items.tsx` (pass the prop)
- Design: `에이전트 Flow › Phase 6 · 결과 확인 · 프로필 수정`
- Logic design: On `choice`, if `ev.note` is set, attach it to the latest `source: 'profile'` result item as `pendingNote`. Still emit the choice panel (`확인했어요` / `그만하기`) as today. Pass `pendingNote` into `ResultCard`. When that choice is answered (any option) or `resolution.status` is `APPROVED` or `REJECTED`, clear `pendingNote` so the normal name/headline card and `바로 지원` return. A choice without `note` does not change the card. Do not drop `detail`.
- Tests: `apps/fo-mobile/src/features/chat/__tests__/stream.test.ts` — `choice note sticks to the profile result`, `answering the choice clears the note`, `choice without note does not set pendingNote`.
- Done when: those tests pass. A profile save choice with `note: 'PDF는 Push 프로필에서 내보낼 수 있어요.'` shows the FE-C-03 card until the user answers.

## FE-C-10 quick-start tabs
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-quick-start-tabs`
- Depends on: FE-C-07 (the sheet is a route). BE paths for the two server segments: read `/Volumes/Untitled/scratch/tasks/` for the BE task that names them. If none names a path, ship only the segments that use data the app already has. Do not invent a URL.
- Files: `apps/fo-mobile/src/features/chat/utils/quick-start-data.ts`, `apps/fo-mobile/src/features/chat/components/quick-start-sheet.tsx`, `apps/fo-mobile/src/features/chat/api/fetchers.ts` (`QsSources`)
- Design: `빠른 시작 › 빠른 시작 · 부족한 점 찾기`, `빠른 시작 › 빠른 시작 · 적합도 보기 (#4)`, `빠른 시작 › 빠른 시작 · 지원 현황 정리`, `빠른 시작 › 빠른 시작 · 커피챗 제안 쓰기`, `빠른 시작 › 빠른 시작 · 허브 프로필 다듬기`
- Logic design: Use `SegmentedControl` from `@/shared/components` (PR #143), not the JS control.
  - Ship now. `gap` and `fit`: segments `북마크 ${n}` and `최근 본 공고`. Bookmark segment uses the bookmarks already loaded. Row sub is `${location} · ${careerLabel}` when both exist (example `서울 강남구 · 4–6년`); location only when career is missing. `careerLabel` is the same label the jobs list uses for that posting.
  - Ship now. `status`: segments `진행 중 ${n}` and `전체 ${n}`. `진행 중` is the existing `ACTIVE` stage set. `전체` is every loaded application. Default segment is `진행 중`.
  - Ship now. `hub` card subs: `경력 · ${careers.length}건` and `기술 스택 · ${skills.length}개`, counted from the profile payload the app already loads for the account. Do not add an endpoint. If the array is missing, keep today's `회사 · 역할` / `쓰는 기술`.
  - Ship now. `coffee` first segment: `팔로잉 ${n}` from the follows list already loaded.
  - Blocked on the BE task file. Second segment `최근 본 공고`: same row shape as bookmarks (`id`, `company`, `title`, `location`, career label). Second segment `허브 추천`: same person row as follows (`userId`, `displayName`, `headline`). Call only the path the BE task names. Empty recent list: one line `최근 본 공고가 없어요.` and no button. Empty hub list: one line `추천할 사람이 없어요.` and no button. Until the path exists, do not render those two segments (the first segment fills the sheet).
- Tests: `apps/fo-mobile/src/features/chat/__tests__/quick-start-data.test.ts` — `gap sub joins location and career`, `status segments split active`, `hub subs count careers and skills`, `recent segment hidden without a source`.
- Done when: those tests pass. Bookmark / 진행 중 / 팔로잉 / hub counts work with current APIs. The two blocked segments appear only after a BE path exists.

## FE-C-11 think, plan, paper, and multi-section panels
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/agent-design` + `feat/agent-stream-v3`
- Depends on: FE-C-07 (materials route for the `변경` row). BE stream v3. `/Volumes/Untitled/scratch/stream-v3-spec.md` was missing. Implement the shapes below. If that spec file exists when you start, its field names win and these shapes are the fallback. Do not render a card the server never sends. Out of this task: feedback card, quality gate (10-21), read-failure choice (10-28), project options (10-15). `StreamOption.desc` and `badge` already map.
- Files: `packages/api-client/src/types.ts` (`StreamEvent`), `apps/fo-mobile/src/features/chat/utils/stream.ts`, `apps/fo-mobile/src/features/chat/types.ts` (items already exist), `apps/fo-mobile/src/features/chat/components/items.tsx` (renderers already exist), `apps/fo-mobile/src/features/chat/components/approval-panel.tsx` (section kinds `chips`, `rows`, `templates` already exist)
- Design: `에이전트 Flow › Phase 2 · 수정 전략` (plan), the paper artboard whose item is `Paper` (`초안 실시간`), `에이전트 › 에이전트 · 중단하고 다시 요청` (`생각함 · n초`), `에이전트 Flow › Phase 0-I · 산출물과 자료 확인` (10-02), `에이전트 Flow › Phase 4-B · 템플릿 고르기` (10-22)
- Logic design: Add stream events and map them. Renderers stay.
  - `think`: `{ type: 'think'; seconds: number; seq?: number }` → `{ type: 'think'; id: 'think-${seq}'; seconds }`.
  - `plan`: `{ type: 'plan'; title: string; meta: string; rows: { tag: string; tone: BadgeTone; label: string; note: string }[]; keywords: string[]; seq?: number }` → the existing `plan` item. `id: 'plan-${seq}'`.
  - `paper`: `{ type: 'paper'; label: string; heading: string; lines: string[]; seq?: number }` → the existing `paper` item. `id: 'paper-${seq}'`.
  - `choice` gains optional `sections` and optional `submitLabel`. When `sections` is present, build `Approval.sections` from them and do not also add a `choices` section from `options`.
    - `{ kind: 'chips'; title?: string; options: StreamOption[]; multiple?: boolean }`
    - `{ kind: 'rows'; title: string; items: { id: string; tag: string; title: string; sub: string }[] }`
    - `{ kind: 'templates'; options: { id: string; label: string; recommended?: boolean }[] }`
    - `{ kind: 'toggle'; id: string; label: string; sub: string; foot: string }`
  - 10-02, when the server sends it: chips `어떤 산출물을 만들까요?` (multiple), rows `가져올 자료`, chips `어떤 말투로 쓸까요?`. A row `변경` opens `/materials` (FE-C-07). It does not dismiss the panel.
  - 10-22, when the server sends it: template thumbnails, then toggle label `프로필 사진 넣기`, sub `마이 › 프로필 사진을 써요`, foot `모든 템플릿`. Submit label is `${selectedLabel}으로 만들기`, default `클래식으로 만들기`. Tapping a thumbnail selects it. It does not send the answer. The button sends it.
  - Ignore unknown section kinds.
- Tests: `apps/fo-mobile/src/features/chat/__tests__/stream.test.ts` — `maps think`, `maps plan`, `maps paper`, `multi-section choice skips the number list`, `template submit label follows the selected thumbnail`.
- Done when: those tests pass. A fixture event of each type renders the existing component. A choice with no `sections` still renders the number list.

## FE-W-01 fo-web copy
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/web-design` + `feat/web-copy`. Before editing `pages/posting/constants.ts` or `shared/api/mock.ts`, `git merge origin/feat/main-tabs-design` and `git merge origin/feat/my-design` (no force-push). Those PRs already own parts of the files.
- Depends on: PR #139, PR #140 (merge, then edit)
- Files: `apps/fo-web/src/pages/posting/constants.ts`, `apps/fo-web/src/pages/settings/constants.ts`, `apps/fo-web/src/pages/notifications/constants.ts`, `apps/fo-web/src/shared/api/mock.ts` (the notification fixture only)
- Design: no web artboard. `gaps/g4-web.md` §1.
- Logic design: Verbatim replacements:
  - `SOURCE_AI`: `에이전트로 맞춘 서류` (`constants.ts`, the line g4 cites as :12).
  - Settings notify label `AI 작업 완료` → `에이전트 작업 완료` (`constants.ts` ~20).
  - `LOCALE_NOTE`: `앱 화면과 에이전트 답변 언어가 함께 바뀌어요.`
  - `NOTIFICATION_NOTE`: `에이전트 작업 완료 알림은 앱에서 받아요`.
  - Mock notification title `AI 작업이 끝났어요` → `에이전트 작업이 끝났어요`.
  - Do not change `CONSENT_COPY` (`다른 사용자와 기업의 AI가…`) or `TERMS_DETAIL` (`해외 AI 제공사`). Those mean a third-party AI. Employer strings are FE-W-06.
- Tests: update `apps/fo-web/src/pages/notifications/notification-note.test.ts`. Add `apps/fo-web/src/pages/settings/copy.test.ts` — `agent locale note`, `agent done label`. Add `apps/fo-web/src/pages/posting/source-copy.test.ts` — `tailored doc label`. Assert the new strings and that `CONSENT_COPY` still contains `기업의 AI`.
- Done when: those tests pass. Legal lines still say `AI`.

## FE-W-02 skeletons
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/web-design` + `feat/web-skeletons` (stack on FE-D-04 so `styles.css` keeps the audit rules)
- Depends on: FE-D-04
- Files: new `apps/fo-web/src/shared/ui/skeleton.tsx`, `apps/fo-web/src/styles.css` (append only), `apps/fo-web/src/pages/home/home-page.tsx`, `apps/fo-web/src/pages/jobs/jobs-page.tsx`, `apps/fo-web/src/pages/hub/hub-page.tsx`, `apps/fo-web/src/pages/social/social-page.tsx`, `apps/fo-web/src/pages/search/search-page.tsx`, `apps/fo-web/src/pages/notifications/notifications-page.tsx`, `apps/fo-web/src/pages/my/documents-panel.tsx`, `apps/fo-web/src/pages/my/activity-panel.tsx`
- Design: no web artboard. `gaps/g4-web.md` §3. Personal pages only. Not employer.
- Logic design: One `Skeleton` component. Each page shows it while `isLoading`, with an sr-only text `불러오는 중`. Counts: home section cards (one row per section that is loading; today a loading section renders nothing), jobs 6 cards in the existing 2-column grid and hide the count and sort row, hub 5 rows, social 3 cards, search 5 rows, notifications 5 rows, my documents 4 rows, my activity 4 rows. Do not change loaded or empty UI (FE-W-03). CSS goes at the end of `styles.css`.
- Tests: `apps/fo-web/src/shared/ui/skeleton.test.ts` — `exposes the loading name`. Assert the sr-only string `불러오는 중`.
- Done when: test passes. A slow list shows blocks instead of the `Status` sentence. The token block at the top of `styles.css` is unchanged.

## FE-W-03 empty and error states
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/web-design` + `feat/web-empty-states` (stack on FE-W-02)
- Depends on: FE-W-02
- Files: `apps/fo-web/src/pages/notifications/constants.ts`, `apps/fo-web/src/pages/notifications/notifications-page.tsx`, `apps/fo-web/src/pages/my/constants.ts`, `apps/fo-web/src/pages/social/social-page.tsx`, `apps/fo-web/src/pages/jobs/jobs-page.tsx`, `apps/fo-web/src/pages/jobs/constants.ts`, `apps/fo-web/src/pages/hub/hub-page.tsx`, `apps/fo-web/src/styles.css` (append)
- Design: no web artboard. `gaps/g4-web.md` §4 only. Do not do §5 or §6.
- Logic design: Empty/error copy is one `b1 w7` block, not the old `b2 t3` line. Empty actions use the existing secondary button class (`sec`), not a primary button.
  - Notifications empty: a 64px bell tile plus `아직 받은 알림이 없어요.` Replace `알림이 없어요.`
  - My activity, with the period: `아직 지원한 공고가 없어요.` / `북마크한 공고가 없어요.` / `아직 팔로우한 사람이 없어요.` / `아직 쓴 글이 없어요.` Update `APPLICATION_EMPTY`, `BOOKMARK_EMPTY`, `FOLLOW_EMPTY`, `POST_EMPTY`.
  - Social empty: `아직 올라온 글이 없어요`. Social error: `글을 불러오지 못했어요` plus button `다시 불러오기` that calls `refetch`.
  - Jobs, only when a filter is on and the list is empty: `조건에 맞는 공고가 없어요.\n필터를 줄여 보세요.` Button `필터 초기화` clears the filter query. An unfiltered empty list stays as it is.
  - Hub: keep `조건에 맞는 프로필이 없어요.` Add `필터 초기화` that clears the hub filter.
- Tests: `apps/fo-web/src/pages/my/empty-copy.test.ts` — `activity empty lines end with a period`. `apps/fo-web/src/pages/notifications/notification-note.test.ts` — extend with the empty line. `apps/fo-web/src/pages/jobs/empty-copy.test.ts` — `filtered empty copy`.
- Done when: those tests pass. Empty screens show the new sentences and a secondary button where listed.

## FE-W-04 apply sheet
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/web-design` + `feat/web-apply-sheet`
- Depends on: FE-W-01 (the label). push-be #222 only for the extra line to appear. Ship the sheet before #222.
- Files: `apps/fo-web/src/pages/posting/apply-sheet.tsx`, `apps/fo-web/src/pages/posting/constants.ts`, `apps/fo-web/src/pages/posting/posting-page.tsx` (pass company and title), `packages/api-client/src/types.ts` (`Source.kind` optional)
- Design: no web artboard. `gaps/g4-web.md` §2. Notes: the extra line shows only when `kind` is present.
- Logic design:
  - Title stays `어떤 서류로 지원할까요?` (`APPLY_TITLE`). Under it, `{company} · {title}`. Omit a missing side and the dot.
  - One radio, 22px, not a checkbox. Default the first source. Choosing the selected radio again leaves it selected. Submit stays disabled when nothing is selected.
  - Row sub: `origin === 'AI'` → `에이전트로 맞춘 서류 · ${when}`. `when` is `오늘` if `createdAt` is today in Asia/Seoul, else `M월 D일`. No `createdAt`: the phrase without ` · `. Other origins: `원본`.
  - Guidance replaces `APPLY_LOCK` in this sheet: `지원하면 마이 › 내 활동 › 지원활동에 기록돼요.`
  - One button, label `이 서류로 지원하기` (`APPLY_CONFIRM`). Do not use `applyConfirmLabel`. Remove the cancel button and the X. Scrim click still closes. Add a grabber (36×4, `deco`) and no close icon.
  - Pending: button label `지원하는 중…`, button disabled.
  - Failure: `지원하지 못했어요. 잠시 후 다시 눌러 주세요.` above the button. Re-enable the button. Clear the error when the selection changes.
  - `함께 보낼 수 있어요` is the sub line of the selected row, and only when that source's `kind` is a non-empty string. Add optional `kind?: string` on `Source`. When the field is absent, the line is absent. Do not show it under the list.
  - Success stays `onApplied()`. Do not change the fit card (FE-W-05).
- Tests: rewrite `apps/fo-web/src/pages/posting/apply-label.test.ts` so the button label is `이 서류로 지원하기` for any count. Add `apps/fo-web/src/pages/posting/apply-sheet.test.ts` — `radio keeps a selection`, `pending label`, `failure label`, `kind line only when kind is set`, `AI sub uses 오늘 for today`.
- Done when: those tests pass. The sheet is a single-select grabber sheet. The kind line is hidden without `kind`.

## FE-W-05 fit card stays
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/web-design` after `git merge origin/feat/main-tabs-design`. No new feature branch if the merge is clean. If you must commit the merge, use `feat/web-design` itself.
- Depends on: PR #139
- Files: do not edit `apps/fo-web/src/pages/posting/fit-card.tsx`, `fit-view.ts`, or `fit-view.test.ts`. FE-W-01 may change `SOURCE_AI` only.
- Design: g4 § "#139에서 이미 처리". Artboard is the mobile fit card #139 already matched.
- Logic design: #139 already shows the real loading line `공고와 서류를 비교하는 중…`, FREE lock, `reachable` → `조금만 고치면 N점대예요` for PRO/ULTRA only when the band rises, the chevron, and the grey D-day badge. Do not rebuild it. After the FE-W-01 label change, the card still reads fit from the API. If `feat/web-design` does not contain those files' #139 behaviour, merge #139 and stop. No second implementation.
- Tests: `pnpm --filter fo-web test -- src/pages/posting/fit-view.test.ts` must pass unchanged.
- Done when: that command passes and `git diff` does not touch the three fit files.

## FE-W-06 employer copy freeze
- Kind: design (Cursor, simple: copy/tokens/layout/markup)
- Branch: base `feat/web-design` + `feat/web-employer-copy`
- Depends on: none
- Files: `apps/fo-web/src/pages/employer/constants.ts`, `apps/fo-web/src/pages/posting/constants.ts` (`EMPLOYER_POSTING_NOTE` only), new test file below. Do not change the strings.
- Design: no web artboard. `gaps/g4-web.md` §7. Owner decision: employer `AI` stays until an employer-term decision. This task locks that.
- Logic design: These values stay exactly:
  - `EMPLOYER_POSTING_NOTE` = `기업 AI 채팅이 열리고 이 공고가 첨부돼요`
  - `VERIFY_LEAD` contains `기업 AI`
  - `VERIFY_DONE_LEAD` = `이제 공고를 올리고 기업 AI를 쓸 수 있어요.`
  - `VERIFY_AI_POSTING` = `기업 AI로 공고 만들기`
  - `AI_POSTING` = `AI로 만들기`
  - `AI_REVIEW` = `기업 AI 서류 검토하기`
  - `CHAT_TITLE` = `기업 AI`
  - `CHAT_ASSISTANT` = `기업 AI`
  - `INVITE_PERKS` still contains `기업 AI 대화 (회사가 함께 봐요)`
  - Do not replace any of these with `에이전트`.
- Tests: `apps/fo-web/src/pages/employer/employer-copy.test.ts` — `employer AI words stay`. One assertion per constant above.
- Done when: the test passes. A search of `pages/employer` shows the same `AI` phrases as before this task.

## FE-X-01 WebView theme sync
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `feat/web-design` + `feat/webview-theme`. The mobile file is on this branch (it merged develop).
- Depends on: FE-D-04 (tokens.css already honours `data-theme`; do not undo the shell)
- Files: `apps/fo-mobile/src/shared/components/detail-web-view.tsx`, `apps/fo-web/index.html` (inline script before CSS), `apps/fo-mobile/src/theme/index.ts` (`useThemeMode` already returns `'light' | 'dark'`)
- Design: no artboard. STATUS: the app passes its theme; fo-web `tokens.css` honours `data-theme`. URL today is only `?mock=1`.
- Logic design: `DetailWebView` builds the query from `useThemeMode()`. Always set `theme=light` or `theme=dark`. Keep `mock=1` when `API_MOCK` is on. Set the WebView `key` to the theme so a change reloads. Do not pass any other param.
  - fo-web, before first paint: if `theme` is `light` or `dark`, set `document.documentElement.dataset.theme` to it. If the param is missing or anything else, do not set `data-theme` (the existing `prefers-color-scheme` rule applies).
  - `apps/fo-web/src/app/shell.tsx` stays `data-theme="light"`. The script must not override an element that already has `data-theme`.
- Tests: `apps/fo-mobile/src/shared/components/detail-web-view.test.ts` — `url carries theme and mock`, `url carries theme without mock`. `apps/fo-web/src/app/theme-query.test.ts` — `accepts light`, `accepts dark`, `ignores other values`.
- Done when: those tests pass. A dark app opens `/postings/:id` with `data-theme="dark"`. The browser shell stays light.

## FE-X-02 app bug follow-ups
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `fix/app-bugs-gate` (PR #145) + `fix/dev-warnings`
- Depends on: none
- Files: `apps/fo-mobile/src/features/home/components/shortcut.tsx` (~34–37), `apps/fo-mobile/src/app/(tabs)/(chat)/_layout.tsx`, `apps/fo-mobile/src/app/(tabs)/(hub)/_layout.tsx`, `apps/fo-mobile/src/app/(tabs)/(my)/_layout.tsx`, `apps/fo-mobile/src/app/(tabs)/(social)/_layout.tsx`
- Design: no artboard. The home shortcut keeps its shadow. The route anchors stay the same screens.
- Logic design:
  - Home shortcut: the icon wrapper sets `shadowColor`, `shadowOpacity`, `shadowRadius`, and `shadowOffset` on a view with no background, which warns. #145 fixed the same warning on glass by drawing `boxShadow` (`07183e7`). Do that here. Replace the four shadow props with `boxShadow: '0px 6px 10px rgba(0,0,0,0.18)'`. Do not add a solid background behind the icon.
  - expo-router ~58 warns: `` `unstable_settings.initialRouteName` is deprecated. Use `unstable_settings.anchor` instead. `` (`layoutAnchor.js`). In each of the four layouts, replace `initialRouteName` with `anchor` and keep the same name: `chat`, `hub`, `my`, `social`.
- Tests: `apps/fo-mobile/src/features/home/shortcut-shadow.test.ts` — `uses boxShadow not shadow props`. Assert the string and that `shadowOpacity` is absent. A layout test is not worth a render; grep is the check in Done when.
- Done when: the shadow test passes. `rg initialRouteName apps/fo-mobile/src` prints nothing. Launching the app does not log the deprecation or the shadow advice for the home shortcut.

## FE-X-03 Maestro flow updates
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: base `develop` after the feature branches merge locally into a throwaway checkout, commit the yaml on `test/maestro-design-gate`
- Depends on: FE-C-01, FE-C-04, FE-C-07, FE-X-02
- Files: `apps/fo-mobile/.maestro/flows/*.yaml` (especially `04_chat_quickstart.yaml`, `06_chat_access_mode.yaml`, `00_fresh_launch_sign_in.yaml`)
- Design: the flows must tap the shipped labels, not the old ones.
- Logic design: Update selectors to the UI these tasks ship. Known stale text in `04_chat_quickstart.yaml`: it taps `AI 채팅` (tab label is `에이전트`) and waits for `네, 반영해 주세요` (the shipped approval buttons are `적용` and `그대로 두기`). Quick start is a native sheet (FE-C-07); tap the visible title `어떤 공고에 맞출까요?` before the URL field. Access-mode flow must look for `에이전트가 어떻게 실행할까요?`. Do not weaken a flow to `assertVisible: ".*"` . Do not add new product flows. `00` stays on the sign-in start #145 fixed.
- Tests: the yaml is the test. `maestro test apps/fo-mobile/.maestro/flows/04_chat_quickstart.yaml` is the smoke for this task. Full suite is FE-X-04.
- Done when: flow 04 passes on the iOS simulator against the integrated build. Every `tapOn` string in `.maestro/flows` exists in the app.

## FE-X-04 iOS and Android gate, then merge
- Kind: logic (state/API/navigation/native wiring/BE)
- Branch: no feature branch. This task runs last, on the integrated branches.
- Depends on: every task in this file. FE-X-03 is the immediate predecessor.
- Files: none. Update PR bodies only: #144, #142, #145, and the fo-web PR.
- Design: no artboard.
- Logic design: Do not merge into `develop` before both runs are green. Run from `apps/fo-mobile`:
  1. iOS: boot a simulator with `simslim`, then `maestro test .maestro/flows`.
  2. Android: `ANDROID_HOME` must be set. `maestro start-device`, then the same `maestro test .maestro/flows`.
  Fix a flow or a bug the run exposes only when the failure is in a task in this file. Do not start new design work.
  After both are green, merge into `develop` in this order, `git merge` (no rebase, no force-push): #136 `chore/split-desktop` → #144 `feat/design-system` → #143 `feat/native-primitives` → #137 `feat/my-copy-s` → #138 `feat/main-pages-copy-s` → #139 `feat/main-tabs-design` → #140 `feat/my-design` → #142 `feat/agent-design` → #145 `fix/app-bugs-gate` → fo-web `feat/web-design`. Skip a PR that is already in `develop`. fo-web has no PR yet: open it against `develop` at this step, after the mobile merges. PR bodies: one paragraph each of what landed, and `depends on` the PRs earlier in this list.
- Tests: the Maestro suite on both platforms. Exit code 0.
- Done when: both Maestro runs exit 0, and `develop` contains the branches in the order above (or the remaining ones, if earlier ones were already merged).
