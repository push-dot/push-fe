# Frontend design handoff status (2026-11-05)

요약: 디자인 반영은 Cursor 클라우드 에이전트가 이어받는다. push-fe develop에는 #141(Maestro 흐름 수정)만 머지됐고, 나머지 FE PR은 모두 열린 상태(머지 금지 — 디자인 반영 끝난 뒤 iOS+Android 테스트 통과 후 머지). force-push 금지, 브랜치를 합칠 때는 merge.

## Sources in this folder
- `push-app/`: Claude Design "Push 앱" export, 17 pages / 173 artboards (one HTML per page; `10-에이전트-Flow/` is 31 artboard folders). Newest design = source of truth. Each page holds iOS light, iOS dark and Android light variants. The canvas "audit 2026-10" CSS layer overrides `design-system/project/tokens.json`.
- `design-system/`: Claude Design "Push 디자인 시스템" (tokens.json, 16 components, icons). Last edited 2026-10-20 (older than the canvas).
- `gaps/g1-auth-home-jobs-hub-social.md`, `gaps/g2-agent.md`, `gaps/g3-my.md`: per-artboard gap analysis of fo-mobile vs the design (tags [없음]/[추가]/[문구]/[상태]/[네이티브]/[BE], sizes S/M/L). `gaps/g4-web.md`: fo-web gap list. `gaps/_native-api.md`: API of the native components in PR #143.

## Rules carried over
- Native look: whatever the design draws as iOS/Android native UI must use platform-native components (`@expo/ui` SwiftUI / Jetpack Compose, native-stack sheets). Navigation: Expo Router native Stack.
- pnpm only. Do not touch apps/fo-desktop (moved to push-dot/push-desktop by #136).
- Merge order when the time comes: #136 → #144 (stacked on #136) → #143 → #137 → #138 → #139 → #140 → #142 → app bug fixes → fo-web. Each branch already merged #143 where noted.

## Who does what (owner decision, 2026-11-05)
**Cursor cloud agents = simple design work only**: styles, tokens, layout, copy, static screen markup. **Paseo agents = all logic**: state, API calls, navigation logic, native component wiring, push-be, stream protocol, migrations. Coordination: Paseo keeps pushing to the existing PR branches below; Cursor branches from the same PR branch it changes (or from this handoff branch for new static markup) and merges, never force-pushes. Nothing merges into develop until design work is done and iOS + Android tests pass.

### Cursor (simple design)
- Copy, verbatim from the design: all g2 S copy items in agent screens (AI→에이전트 in 실행 방식 title, consent body, account section, 내 서류/내 링크 lines; consent title line break; @언급 sub-lines and 3 바로가기; plan sheet header/footer; empty states for 내 링크/북마크/conversation list; link-delete confirm body; quick-start sub-lines); remaining S copy in g1/g3; fo-web copy (settings constants, notifications note, "AI로 맞춘 서류" → "에이전트로 맞춘 서류"; legal lines keep "AI").
- Canvas "audit 2026-10" visual rules (on feat/design-system #144): tab bar colours in `src/app/(tabs)/_layout.tsx` (iOS idle t1 / selected acText; Android idle t3 / selected t1), selected ring (acSoft fill + 1.5px inset ac) in approval-panel choice rows/template cards and quick-start-sheet option cards, 48px touch targets (Chip, approval-panel MiniChip, 40px composer buttons, status-row stop button), fo-web equivalents.
- Layout/markup: minimum heights so large text is not clipped; fo-web skeletons, empty/error states (text style, secondary buttons, bell tile, 마이 empty copy), jobs filter/search visual details, hub "내 프로필" buttons markup, social composer labels, 마이 내 활동 section titles, offer rows layout.
- Static markup for the 10-24 pre-confirm card layout ("Push 프로필에 저장했어요" + note + 프로필 보기) — Paseo wires the state.

### Paseo (logic)
- Native component wiring (PR #143 API in gaps/_native-api.md): native sheet routes + state stores replacing every JS BottomSheet — main tabs (job filters, apply, hub filter, proposal, compose category; compose as Android sheet), 마이 (서류 가져오기, 내 프로필로 전환, 수락 reply, settings pickers, 일정 추가, confirms via a store + confirm route), agent (동의, quick start, 자료 고르기; account pickers via inline Menu). Menus/ContextMenu with real actions (sort menus, 게시물 상세 더 보기, conversation ⋯ with 고정/보관 order, long-press with preview + 이름 바꾸기, 내 링크 ⋯, language, 직군·연차, 서류 ⋯). DatePicker wiring (경력 month, 일정 추가). Undo toast for link delete (own ToastHost in the pageSheet).
- API/state: Hub chips 추천/제안/보낸 제안 (explore=recommended/received/offers), 내 프로필 PDF로 내보내기 (POST /documents/{id}/exports on the HUB_PROFILE doc), 내 프로필로 전환 202 + job polling, apply sheet "함께 보낼 수 있어요" (sources.kind after push-be #222), 10-24 card state (choice.note through the mapper), WebView theme sync (app passes its theme; fo-web tokens.css honors data-theme), fo-web apply sheet + fit card logic, any new server data (stream v3, quick-start data APIs).
- Backend (push-be, merged to develop by Paseo): #222 finish + merge; remaining stream items (think/plan/paper events, feedback card, multi-section choice panels 10-02/10-22, quality gate 10-21, read-failure choice 10-28); quick-start data APIs (recently viewed postings, per-posting doc status, this week's events, suggested experiences, hub-recommended people, career-post topics, match chips); search sort param; per-part fit breakdown on applications; 서류→프로필 section picking; Push 서류 share URL; mobile document version write for section editing.
- Testing after design work: Maestro iOS + Android, then merges in the order above.

## Branches and PRs
| Branch | PR | Head | State |
|---|---|---|---|
| chore/split-desktop | #136 → develop | c330a47 | Done. Removes apps/fo-desktop + old packages/design-system (now push-dot/push-desktop, history kept). CI green. |
| feat/design-system | #144 → chore/split-desktop | b469d75 | Tokens done; component rules not done (see below). Merged #143. |
| feat/native-primitives | #143 → develop | 83a98ce | Done (Switch, SegmentedControl, Menu, ContextMenu, DatePicker, showToast/ToastHost, native sheet route + Sheet). Not run on a device yet. |
| feat/my-copy-s | #137 → develop | 03ec7bf | Done (마이 copy/spacing, AI→에이전트). |
| feat/main-pages-copy-s | #138 → develop | 38f7827 | Done (main tab copy/spacing). |
| feat/main-tabs-design | #139 → develop | 7570758 | Round 1 done; native adoption not done. Merged develop + #143. |
| feat/my-design | #140 → develop | fbed123 | Round 1 done; native adoption partly (via shared imports). Merged develop + #137 + #143. |
| feat/agent-design | #142 → develop | 9a93928 | Round 1 done (uses push-be #223); native adoption + S copy not done. Merged develop + #143. |
| fix/app-bugs-gate | #145 → develop | latest | App bugs from the iOS gate fixed: sign-in start screen (redirectTo), quick start sheet hidden from a11y (scrim 1pt taller), sheet keyboard, Glass shadow warning, mock dates. Last iOS gate 5/6; flow 04 selector fix not gate-verified. |
| feat/web-design | none yet | ecf564b | Only merges (develop + #144); fo-web code not started. Gap list = gaps/g4-web.md. |
| test/e2e-flows-ios | #141 merged | — | Maestro flows fixed for iOS. |

## Details per branch
### A feat/main-tabs-design (PR #139) @7570758 — merged origin/develop + origin/feat/native-primitives (#143). fo-mobile typecheck/lint/192 tests OK, fo-web typecheck OK.
Done: skeleton loaders; login/phone/code/terms; trending search (GET /search/trending); notifications empty; fo-web fit card real API + reachable ("조금만 고치면 N점대예요", PRO/ULTRA, only when band rises); profile counts; proposal chip logos; compose labels; WebView text size.
Not done: native sheets (job filters, apply, hub filter, proposal → root sheet routes job-filter/apply/hub-filter/proposal with sheetOptions + Sheet + zustand); native menus (최신순 sort, 관련도순 — search has no sort param, 게시물 상세 더 보기, compose category); compose as Android sheet; Hub chips 추천/제안/보낸 제안 (add explore=received to api-client ProfileFilters); 내 프로필 기본 정보 편집 + PDF로 내보내기 (POST /documents/{id}/exports on HUB_PROFILE doc); Maestro updates; PR body "depends on #143". Server-blocked: "함께 보낼 수 있어요" needs sources.kind (push-be #222).

### DS feat/design-system (PR #144, base chore/split-desktop = #136) @b469d75 — merged origin/feat/native-primitives (#143). fo-mobile typecheck + 196 tests OK (full root check not rerun after merge).
Done: packages/design-system (@push/design-system) from Claude Design tokens.json + canvas.json override (canvas "audit 2026-10" wins: t3/t4 light #646B75, t4 dark #8C939C, ac dark #6B5BFA, acPress dark #5E4FEA, red/green/orange light #C9302C/#087A3E/#AD4E00; added acPress/paper/deco), generator + parity tests, CSS vars for web; fo-mobile src/theme reads all values from the package (icon-data.ts removed, same icons); fo-web uses the package CSS (.browser palette replaced). Pretendard kept (canvas lists Noto Sans KR first — not adopted).
Not done (canvas audit component rules): tab bar colors in src/app/(tabs)/_layout.tsx (NativeTabs iconColor/labelStyle: iOS idle t1 selected acText; Android idle t3 selected t1); selected ring (acSoft fill + 1.5px inset ac) in approval-panel.tsx choice rows/template cards, quick-start-sheet.tsx ~372/~437, maybe settings-screen.tsx:74, filter-row.tsx; 48px touch targets (Chip 34px, approval-panel MiniChip 28px, 40px composer buttons in composer-body.tsx/mode-picker.tsx/comment-composer.tsx, status-row stop button); fo-web equivalents; WebView theme sync (app should pass its theme; fo-web tokens.css already honors data-theme; URL only carries ?mock=1); PR body update. Primary-button glow: nothing to change.

### B feat/my-design (PR #140) @fbed123 — merged origin/develop (#141), origin/feat/my-copy-s (#137), origin/feat/native-primitives (#143). fo-mobile typecheck/lint/198 tests OK.
Round 1 done: Push 서류 보기 layout, 지원한 공고 상세 (stub replaced), 제안 메시지 as its own Stack screen, 대화 기록 보관 row removed, other M items; new Maestro flows 06_my_application_detail, 07_my_offer_messages (never run validly).
Round 2: 마이 tabs, 제안함, career-status segments and settings switches now use #143 SegmentedControl/Switch via shared imports (not seen on device).
Not done: theme as SegmentedControl (still text radio); DatePicker (경력 start/end month, 일정 추가 date+time); Menu (language, 직군·연차, 서류 ⋯ DocMenu, top-bar menus on Push 서류/제안 메시지 — design draws 더 보기 but no menu items: needs a decision); native sheet routes replacing every JS BottomSheet in 마이 (서류 가져오기, 내 프로필로 전환, 수락 reply, settings 연락처/말투 pickers, 일정 추가; confirms 서류 삭제/경력 삭제/기본 프로필로 설정). Plan: formSheet routes offers/[id]/reply, docs/[id]/to-profile, settings/pick, activity/add-event; confirms via a store + confirm route (also registered in (my) stack). PR body "depends on #137, #143". Server-blocked (#222): stage timestamps, calendar location, sources kind. Also: fit breakdown, 전환 section checklist, Push 서류 editing, share, 고객센터/약관 links.

### C feat/agent-design (PR #142) @9a93928 — merged origin/develop (#141) + origin/feat/native-primitives (#143). 208 tests, typecheck OK (needed `expo start` once to regenerate router types; gitignored).
Round 1 done (uses push-be #223, merged): history restore via GET /conversations/{id}/turns; todo by id step by step; tool lines (target/resultLine/+N줄/warning); fit card 5 parts + band + keywords, FREE locked, PRO teaser, ULTRA projection, boost before→after; done summary above result card; diff preview before approval (그대로 두기 · 적용); gate badge from `badge`, apply warning foot; sidebar 확인 필요/작업 중 + lastLine; api-client types + turns endpoint, mock, flow 04.
Not done: conversation ⋯ Menu (+ 고정/보관 order); long-press ContextMenu with preview (+ 이름 바꾸기); 내 링크 ⋯ Menu + undo showToast (needs own ToastHost inside the pageSheet); native sheet routes for 동의, quick start (should fix the iOS a11y-tree bug), 자료 고르기 — account pickers (말투, 실행 방식) live inside the account pageSheet → inline Menu with `selected` is safer; 10-24 pre-confirm card (pass choice.note through the mapper); all g2 S copy (AI→에이전트 in 실행 방식 title, consent body, account section, 내 서류/내 링크 lines; consent title line break; @언급 sub-lines + 3 바로가기; plan sheet header/footer; empty states 내 링크/북마크/conversation list; link-delete confirm body; quick-start sub-lines; min heights for large text); PR body update. Out of scope (server has no data): think/plan/paper events, feedback card, multi-section panels 10-02/10-22, project options 10-15, quality gate 10-21, read-failure 10-28, quick-start data tabs (북마크/최근 본 공고, 팔로잉/허브 추천).

## Backend (push-be) facts the frontend can use
- Merged to develop/staging: #221 (uploaded source → profile 200/202+jobId, no-posting 4-step checklist, fit `reachable`, `explore=received`, offer recipient avatarUrl/companyName/headline, profile PDF = POST /documents/{id}/exports on the HUB_PROFILE doc), #223 (agent stream: GET /conversations/{id}/turns, todo id/added, tool target/resultLine/extra/warning, fit event fields, result summary/fitFrom/fitTo/bullets, approval hunks/foot, choice detail, StreamOption desc/badge, conversation lastLine).
- Pending: #222 (stage timestamps `stageEnteredAt`, calendar `location`, sources `kind`) — needs migration 0036; until it lands keep those UI parts behind fallbacks.

## Testing (after design work)
- Maestro flows: apps/fo-mobile/.maestro (mock API). Local runner used tonight: iOS simulator via simslim; Android needs an SDK (`maestro start-device` requires ANDROID_HOME).
- Known iOS failures before fixes: 00 login start (logged-out launch opens the phone screen) and 04 quick start sheet missing from the iOS accessibility tree (expected fix: native sheet route).
