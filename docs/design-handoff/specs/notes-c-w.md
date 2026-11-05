# File pointers for FE-C / FE-W (from the stopped logic agent, branches feat/agent-design @9a93928, feat/web-design @ecf564b)
1. Conversation ⋯ menu: apps/fo-mobile/src/screens/chat/conversation-screen.tsx — JS MoreMenu modal (lines 77–91, 226–266), 4 actions; 고정 and 보관 missing.
2. Long-press menu: src/features/chat/components/conversations-modal.tsx:80-88 uses Alert.alert; src/features/chat/utils/conversation-menu.ts:3-7 lacks 이름 바꾸기.
3. 내 링크 ⋯ + undo toast: src/features/chat/components/links-modal.tsx (BottomSheet + Alert today).
4. Native sheet routes to build: 동의 consent-sheet.tsx; quick start quick-start-sheet.tsx; 자료 고르기 composer-area.tsx:99-135; account pickers → inline Menu with `selected` in account-modal.tsx:136-151.
5. 10-24 pre-confirm card: packages/api-client/src/types.ts already has `note?: string` on the choice event; the choice mapper at src/features/chat/utils/stream.ts:122-124 drops it and `Approval` has no `note` field; result card items.tsx:412-465. Server order: profile result card first, then the `present` gate (gate, note, documentId); in BYPASS the gate is auto-answered → no pre-confirm state then.
6. fo-web apply sheet: apps/fo-web/src/pages/posting/apply-sheet.tsx — radio state, submit, in-progress/failure states, "함께 보낼 수 있어요" only when sources `kind` present (push-be #222).
7. WebView theme sync: nothing yet on either side.
Gotchas: N0 `Menu` needs a plain View child — it cannot wrap GlassButton (renders Pressable); the ⋯ trigger needs a non-pressable icon View. No Menu/ContextMenu/showToast call sites exist yet on any branch (no pattern to copy).

Decisions (Opus, from docs/api-spec.md + design):
- Apply sheet: one radio choice for the main 서류 PLUS optional portfolio rows that can be added on top ("함께 보낼 수 있어요 · {date}" sub-line) — matches api-spec "포트폴리오를 함께 고를 수 있다".
- sources.kind: mobile uploads always send kind=RESUME today, so no upload is a portfolio. Spec must add a kind choice (이력서 / 포트폴리오) to the 서류 가져오기 flow only if the design shows it; otherwise keep RESUME and list it as an open product question.
- WebView theme sync: pass the RESOLVED light/dark (not "system") via the existing bridge (`window.__PUSH__` + `push:token`); WebView routes render without Shell so `data-theme` on <html> works; browser Shell hardcodes data-theme="light" (leave browser as is).
