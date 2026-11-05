# FE tasks: area A (main tabs, PR #139) and area B (마이, PR #140)

Paseo logic design, 2026-11-05. Cursor cloud agents write all code.
I read these sources, read-only: handoff `STATUS.md` @48870c5, `gaps/g1-auth-home-jobs-hub-social.md`, `gaps/g3-my.md`, `gaps/_native-api.md`. Branches: `feat/main-tabs-design`@7570758, `feat/my-design`@fbed123, `feat/main-pages-copy-s` (#138)@38f7827. push-be: `develop`@1799b66 and PR #222 (open). Paths without a prefix are relative to `apps/fo-mobile/`.

## Shared rules for every task

- **Native sheet route.** Follow the `access-mode` example.
  - The route file `src/app/<route>.tsx` is one line that renders `src/screens/<area>/<name>-sheet-screen.tsx`.
  - Register `<Stack.Screen name="<route>" options={sheetOptions(c, detents)} />` inside the `session` guard of `src/app/_layout.tsx`.
  - The screen wraps its content in `<Sheet title description action>`.
  - Open it with `router.push({ pathname, params })` and close it with `router.back()`.
  - Long content uses detents `[0.5, 1]` and a `ScrollView` inside `Sheet`. Everything else uses `'fitToContents'`.
- **Params are strings only.** Read them with `useLocalSearchParams<…>()` and check them. On a missing or invalid param, call `router.back()` in an effect and render `null`. Never pass callbacks or objects in params.
- **Shared state.** When state must go in or out of a sheet, put it in a small zustand store in `src/features/<name>/stores.ts`, exported via `export * from './stores'` in the feature root `index.ts`. Stores hold local UI state only, never server data.
- **Menus.** Use `Menu` from `@/shared/components`. The child is a plain `View`, so turn the old `Pressable` trigger into a `View`. Single-choice menus set `selected` on the current item. `systemImage` is iOS only.
- **Toast after a sheet.** Call `router.back()` first, then `showToast({ message })`.
- **Retiring `BottomSheet`.** Remove each JS `BottomSheet` use you replace. Do not delete `src/shared/components/bottom-sheet.tsx`, because the agent area still uses it.
- **Code style.**
  - Files in kebab-case.
  - Components are const arrows with a separate `export default`.
  - No comments except `shortcut:` lines.
  - Inline styles, like the code around them.
  - Inside a feature, use relative imports. Outside it, import only from `@/features/<name>`.
- **Visible markup that a logic task adds** stays minimal. List it under "Needs design pass" in the #139 or #140 PR body.
- **Verify** on every branch: `pnpm --filter @push/fo-mobile typecheck && pnpm --filter @push/fo-mobile lint && pnpm --filter @push/fo-mobile test`.
  - If `packages/api-client` changed, also run `pnpm --filter @push/api-client typecheck && pnpm --filter @push/api-client test`.
  - If `apps/fo-web` changed, also run `pnpm --filter @push/fo-web typecheck && pnpm --filter @push/fo-web test`.
- **Git.**
  - Branch from the PR branch and open your PR into that PR branch.
  - Merge, never rebase or force-push.
  - Never target `develop`.
  - Before each push, run `git fetch` and merge `origin/<your PR branch>`.
- **Ordering.** Several tasks edit `src/app/_layout.tsx`. Land A and B tasks in ID order within each area to avoid conflicts.

## Decisions (one place)

| Thing | Name / value |
|---|---|
| Root sheet routes (A) | `job-filter?kind=<FilterKey>`, `apply?postingId=`, `hub-filter`, `proposal?userId=` |
| Root sheet routes (B) | `confirm`, `docs/import`, `docs/[id]/to-profile`, `offers/[id]/reply`, `settings/pick?field=contact\|tone`, `activity/add-event?day=YYYY-MM-DD` |
| (my) stack sheet route | `(tabs)/(my)/confirm`, used only from screens inside the (my) stack modal (`edit-profile/[section]`) |
| Stores | `useJobListStore` (jobs), `useHubFilterStore` (hub), `useDocImportStore` (my), `useConfirmStore` + `askConfirm()` (shared, next to `toast-store.ts`) |
| Compose | iOS stays `presentation: 'modal'`. Android uses `sheetOptions(c, [1])`. Category is picked with a `Menu`. |
| Hub 탐색 | `추천` → `recommended`, `제안` → `received` (offers the user received), `보낸 제안 N` → `offers` |
| Posting sort labels | `최신순` (latest), `마감 임박순` (deadline), `인기순` (popular) |
| Search sort | Typed `SearchSort = 'relevance'`. The menu appears only once there are 2 or more options, which needs a push-be sort param. |
| 게시물 상세 더 보기 | `공유하기`, `링크 복사`. No edit or delete, because push-be has no post update/delete endpoint. |
| 서류 ⋯ | Native `Menu`: `서류 보기`, `서류 삭제하기` (destructive), which opens `confirm` |
| Push 서류 ⋯ | `공고 보기` (only when there is an application), `보관하기` (archive with confirm) |
| 제안 메시지 ⋯ | `허브 프로필 보기`, `제안 내용 보기` |
| Profile PDF | fo-web shows the button only when a base `HUB_PROFILE` doc exists and sends bridge message `profile-pdf`. The app runs POST exports → GET binary → share sheet → POST result. No polling, because the GET is synchronous. `rendererVersion: 'ai-export'`, `photo=1`. |
| 내 프로필로 전환 | The sheet stays open while job polling runs, then opens `/docs/push/{documentId}` once the job is `DONE` |
| 일정 추가 defaults | Type `INTERVIEW` (as in the design), time 09:00 (current behaviour) |
| Filter chip text | Career shows `경력 4–6년`. Other kinds show the value only (`개발 외 1`, `정규직`). `전체` is on only when no filter is set (current behaviour). The empty-state artboard's `직군 · 개발` format is not adopted. |
| Fit parts | 5 parts (first artboard, fo-web and push-be agree) |

---

## FE-A-01 Merge the main-tab copy PR #138 into #139
- Kind: design
- Branch: `feat/main-tabs-design` → `chore/merge-main-pages-copy`
- Depends on: #138 (`feat/main-pages-copy-s`@38f7827)
- Files: merge `origin/feat/main-pages-copy-s`. Expected conflicts: `src/screens/auth/sign-in-screen.tsx`, `src/screens/hub/hub-screen.tsx`, `src/screens/search/search-screen.tsx`, `src/screens/social/social-screen.tsx`. Take the rest from #138 as is: `src/features/jobs/constants.ts`, `src/features/jobs/utils/apply-doc.test.ts`, `src/features/notifications/components/notification-row.tsx`, `src/features/search/components/posting-row.tsx`, `src/features/search/utils/search-tab.ts`, `src/features/search/utils/search-tab.test.ts`, `src/screens/jobs/posting-detail-screen.tsx`.
- Design: 01-Auth › 로그인; 11-Hub › 허브; 02-Home › 홈 · 검색 · 상태; 12-Social › 소셜 · 상태; 04-공고-상세 › 채용공고 상세
- Logic design: when resolving conflicts, keep the #139 structure (Mascot, top error banner, skeletons, StatusNote, trending, `tab === 'postings'` sort label) and take these #138 strings and variants:
  - Sign-in title `'AI와 함께 하는 커리어,\nPush에서 시작하기'`, with no subtitle line.
  - Hub top bar `<Button label="내 프로필" variant="secondary" size="sm" …/>`.
  - Search count unit from `TABS[].unit` (`명` for people).
  - Social empty-state `글쓰기` with `variant="secondary"`.
  - posting-row highlights only the title.
  - notification-row uses the same weight for unread and read.
  - `에이전트로 맞추기` and `APPLY_DOC_NOTE.ai = '에이전트로 맞춘 서류'`.
- Tests: the existing #138 tests `apply-doc.test.ts` and `search-tab.test.ts` pass.
- Done when:
  - There is a merge commit on `feat/main-tabs-design`.
  - `rg -n "AI로 맞추기|AI로 맞춘 서류|내 프로필 보기|공고에 맞는 이력서" apps/fo-mobile/src` returns nothing.
  - Verify passes.

## FE-A-02 Job filters as native sheet route `job-filter`
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/job-filter-sheet`
- Depends on: FE-A-01
- Files:
  - New: `src/features/jobs/stores.ts`, `src/features/jobs/stores.test.ts`, `src/screens/jobs/job-filter-sheet-screen.tsx`, `src/app/job-filter.tsx`.
  - Modified: `src/features/jobs/{index.ts,types.ts,constants.ts}`, `src/features/jobs/components/filter-sheet-body.tsx` (drop `BottomSheet`, `visible` and `onClose`; it becomes plain body content), `src/screens/jobs/job-list-screen.tsx`, `src/app/_layout.tsx`.
  - Deleted: `src/features/jobs/components/filter-sheet.tsx` and its export.
- Design: 03-채용공고 › 채용공고 · 경력 필터 / 직군 필터 / 기술 스택 필터 / 지역 필터 / 고용형태 필터
- Logic design:
```ts
// types.ts
export type PostingSort = NonNullable<PostingFilters['sort']>
// constants.ts
export const LONG_FILTER_KINDS: FilterKey[] = ['skills', 'location']
// stores.ts
type JobListState = { filters: Filters; sort: PostingSort; setFilters: (filters: Filters) => void; setSort: (sort: PostingSort) => void; reset: () => void }
export const useJobListStore = create<JobListState>()((set) => ({
  filters: EMPTY, sort: 'latest',
  setFilters: (filters) => set({ filters }), setSort: (sort) => set({ sort }),
  reset: () => set({ filters: EMPTY, sort: 'latest' }),
}))
```
  - **JobListScreen**:
    - Reads `filters` and `sort` from the store.
    - Each filter chip calls `router.push({ pathname: '/job-filter', params: { kind: k } })`.
    - The `전체` chip and the empty-state reset call `setFilters(EMPTY)`.
    - `useEffect(() => reset, [reset])`, so leaving the list resets filters as today.
    - Query: `{ ...toQuery(filters), sort }`.
  - **Sheet screen**:
    - Valid `kind`: `FILTER_KEYS.includes(kind)`.
    - `draft` starts as `useState(() => useJobListStore.getState().filters)`.
    - The body is the current title row (title + 초기화) plus the options.
    - The `Sheet` action is the current `공고 N개 보기` label. Its `onPress` runs `setFilters(draft); router.back()`.
    - Swiping down discards the draft.
  - **Detents**: `options={({ route }) => sheetOptions(c, LONG_FILTER_KINDS.includes((route.params as { kind?: FilterKey })?.kind as FilterKey) ? [0.5, 1] : 'fitToContents')}`. Long kinds wrap the body in `ScrollView keyboardShouldPersistTaps="handled"`, because the skills filter has a search field.
- Tests: `stores.test.ts`: `setFilters replaces the filters`, `reset restores EMPTY and latest`.
- Done when:
  - Verify passes.
  - On iOS, a chip opens a native sheet with a grabber, and dragging it down closes it without applying.
  - On Android, the Material sheet has a drag handle.
  - `공고 N개 보기` applies the filters.
  - `.maestro/flows/01_home_jobs_apply.yaml` passes with its selectors unchanged (`직군`, `개발`, `공고 .*개 보기`).

## FE-A-03 Sort menu on 채용공고
- Kind: logic
- Branch: `feat/job-filter-sheet` (same PR as A-02) or `feat/job-sort-menu`
- Depends on: FE-A-02
- Files: `src/features/jobs/constants.ts`, `src/screens/jobs/job-list-screen.tsx`
- Design: 03-채용공고 › 채용공고 · 전체 목록 (`최신순 ⌄`)
- Logic design:
  - `export const POSTING_SORTS: { key: PostingSort; label: string }[] = [{ key: 'latest', label: '최신순' }, { key: 'deadline', label: '마감 임박순' }, { key: 'popular', label: '인기순' }]`.
  - Wrap the existing label `View` in `<Menu accessibilityLabel={`정렬, ${label}`} actions={POSTING_SORTS.map((s) => ({ key: s.key, label: s.label, selected: s.key === sort, onPress: () => setSort(s.key) }))}>`.
  - The label shows the selected option. Do not add `withDeadlineWindow` here, because the 7-day window belongs only to the section screen.
  - The menu stays hidden while `pages.isPending`, as today.
- Tests: none new. This is a constant plus wiring, and the store test covers `setSort`.
- Done when: choosing `마감 임박순` refetches with `sort=deadline` and the label changes. Verify passes. Needs design pass: the `마감 임박순` and `인기순` labels (the design only shows 최신순).

## FE-A-04 Apply sheet as native route `apply`
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/apply-sheet`
- Depends on: FE-A-01
- Files:
  - New: `src/screens/jobs/apply-sheet-screen.tsx`, `src/app/apply.tsx`.
  - Modified: `src/features/jobs/components/apply-sheet.tsx` (becomes body content with no `BottomSheet` or `visible`), `src/features/jobs/api/hooks.ts`, `src/screens/jobs/posting-detail-screen.tsx`, `src/app/_layout.tsx`.
  - Deleted: `src/features/jobs/components/posting-toast.tsx` if nothing else imports it (grep first).
- Design: 04-공고-상세 › 채용공고 상세 · 지원 서류 고르기 / · 지원 완료 / · 상태
- Logic design:
  - Param `postingId`. The screen reads `usePosting(postingId)` (already cached by the detail screen) for company and title, and `useApplyDocs(true)` for the list. Detents `[0.5, 1]`, with the doc list in a `ScrollView`.
  - `useApplyPosting(postingId, onApplied)` `onSuccess`:
    1. `qc.setQueryData(['postings','detail',postingId], (p) => p && { ...p, applied: true })`.
    2. Then the existing invalidate of `['postings']`.
  - The screen's `onApplied` is `router.back(); showToast({ message: '지원했어요. 내 활동에서 진행 상황을 볼 수 있어요' })`.
  - **Posting detail**:
    - Drop the `applying`, `applied` and `toast` state.
    - The CTA label is `p?.applied ? '지원 완료' : '지원하기'`, disabled when `!p || p.applied`.
    - Its `onPress` is `router.push({ pathname: '/apply', params: { postingId: id } })`.
  - Pending label (`지원하는 중…`) and the inline error line stay as they are. Keep the `함께 보낼 수 있어요` line until FE-A-12.
- Tests: none new (thin wiring). The existing `apply-doc.test.ts` must pass.
- Done when: in Maestro `01_home_jobs_apply.yaml`, `지원하기` → `이 서류로 지원하기` → `지원 완료` passes on iOS. The toast appears after the sheet closes. Verify passes.

## FE-A-05 Hub filter route `hub-filter` with 탐색 chips (`explore=received`)
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/hub-filter-sheet`
- Depends on: FE-A-01. push-be `explore=received` is already on develop (#221).
- Files:
  - New: `src/features/hub/stores.ts`, `src/screens/hub/hub-filter-sheet-screen.tsx`, `src/app/hub-filter.tsx`.
  - Modified: `packages/api-client/src/types.ts` (`ProfileFilters.explore?: 'recommended' | 'offers' | 'received'`), `src/features/hub/utils/filters.ts`, `src/features/hub/utils/filters.test.ts`, `src/features/hub/index.ts`, `src/features/hub/components/hub-filter-sheet.tsx` (becomes body content), `src/screens/hub/hub-screen.tsx`, `src/app/_layout.tsx`.
- Design: 11-Hub › 허브 · 필터; 11-Hub › 허브
- Logic design:
```ts
export type Explore = NonNullable<ProfileFilters['explore']>
export type SheetFilters = { tenure: Tenure[]; status: CareerStatus[]; explore: Explore }
export const appliedCount = (f: SheetFilters) => f.tenure.length + f.status.length + (f.explore === 'recommended' ? 0 : 1)
// stores.ts
type HubFilterState = { category: JobCategory[]; sheet: SheetFilters; setCategory: (category: JobCategory[]) => void; setSheet: (sheet: SheetFilters) => void; reset: () => void }
export const useHubFilterStore = create<HubFilterState>()(…) // reset → { category: [], sheet: EMPTY_SHEET }
```
  - **탐색 chips**, in this order:
    - `추천` → `recommended`.
    - `제안` → `received`.
    - `` `보낸 제안${sent === undefined ? '' : ` ${sent}`}` `` → `offers`.

    It's a single select, and tapping the selected chip keeps it on. Delete the separate `보낸 제안 {n}` text. `sent = useProfileCount(['offers'], { explore: 'offers' }, true)`.
  - **Sheet**:
    - The draft starts from the store's `sheet` on mount.
    - The count is `useProfileCount([category, draft], profileQuery(category, draft), true)`.
    - The action label is the current `프로필 N개 보기`. Applying runs `setSheet(draft); router.back()`.
    - Detents `fitToContents`.
  - **HubScreen**:
    - `category` and `sheet` come from the store.
    - The FilterButton calls `router.push('/hub-filter')`.
    - The empty-state reset calls the store's `reset`.

    The tab screen never unmounts, so nothing resets on blur.
- Tests: `filters.test.ts`: `appliedCount counts received as one filter`, `appliedCount counts offers as one filter`, `profileQuery passes explore=received`.
- Done when: choosing `제안` requests `GET /profiles?explore=received`, and the FilterButton shows 1. `보낸 제안 N` can be selected. Verify passes for fo-mobile and api-client. Needs design pass: the list title for the received and offers views (the design only has `추천 프로필`, which is unchanged for now).

## FE-A-06 Proposal sheet route `proposal`
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/proposal-sheet`
- Depends on: FE-A-01
- Files:
  - New: `src/screens/hub/proposal-sheet-screen.tsx`, `src/app/proposal.tsx`.
  - Modified: `src/features/hub/components/proposal-sheet.tsx` (becomes body content), `src/features/hub/utils/filters.ts` (`proposalSubtitle`), `src/features/hub/utils/filters.test.ts`, `src/screens/hub/profile-detail-screen.tsx` (drop the `proposing` state and the `invalidateDetail` use), `src/app/_layout.tsx`.
- Design: 11-Hub › 제안하기 시트
- Logic design:
  - Param `userId`. The screen reads `useProfile(userId)` for the name and `proposalSubtitle(p)`, where `proposalSubtitle = (p) => [careerLine(p), CAREER_STATUSES.find((s) => s.key === p.careerStatus)?.label].filter(Boolean).join(' · ')` (moved out of profile-detail-screen).
  - Bookmarks come from `useOfferBookmarks(true)`.
  - `useSendOffer(…, onDone = () => router.back(), setError)`. It already invalidates `['profiles']`, which includes the detail.
  - The `제안하기` capsule calls `router.push({ pathname: '/proposal', params: { userId: id } })`. It stays hidden on your own profile.
  - Detents `fitToContents`.
  - Known risk: the Android keyboard. The Done-when check includes typing on Android. If the keyboard covers `제안 보내기`, report it in the PR and don't change the presentation.
- Tests: `proposalSubtitle joins career line and status`.
- Done when: Maestro `02_hub_proposal.yaml` passes (`제안하기` → type → `제안 보내기` → sheet gone). Verify passes.

## FE-A-07 Compose: category Menu and Android sheet
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/compose-native`
- Depends on: FE-A-01
- Files: `src/screens/social/compose-screen.tsx`, `src/app/(tabs)/(social)/_layout.tsx`, `.maestro/flows/03_social_compose.yaml` (only if a selector breaks)
- Design: 12-Social › 글쓰기 시트
- Logic design:
  - Replace the category `BottomSheet` with `<Menu accessibilityLabel={`카테고리, ${label}`} actions={<same category list the sheet uses>.map((k) => ({ key, label, selected: key === category, onPress: () => setCategory(key) }))}>` wrapping the category row. The row becomes a `View`.
  - In `(social)/_layout.tsx`, `TabStack` reads `useColors()` and uses `<Stack.Screen name="compose" options={Platform.OS === 'android' ? sheetOptions(c, [1]) : { presentation: 'modal' }} />`.
- Tests: none (wiring).
- Done when:
  - On iOS, the category opens a pull-down menu. On Android, it opens a dropdown, and compose shows as a full-height Material sheet with a drag handle.
  - Typing the body on Android keeps the input visible. If not, report it in the PR.
  - Maestro `03_social_compose.yaml` passes on iOS (`카테고리.*` then `개발`).

## FE-A-08 게시물 상세 더 보기 Menu
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/post-detail-menu`
- Depends on: FE-A-01
- Files:
  - New: `src/features/social/utils/share-message.ts`.
  - Modified: `src/features/social/utils/index.ts`, `src/features/social/utils/lib.test.ts`, `src/shared/infrastructure/platform.ts`, `src/shared/infrastructure/index.ts`, `src/screens/social/post-detail-screen.tsx`.
- Design: 12-Social › 게시물 상세; 15 마이-내-활동 › 마이 · 내 활동 · 게시글 상세
- Logic design:
  - `export const copyText = (text: string) => Clipboard.setStringAsync(text)` (expo-clipboard is already installed).
  - `postUrl = (id: string) => `${WEB_BASE_URL}/posts/${id}`` (fo-web has route `/posts/:id`).
  - `postShareMessage = (id, post?) => `${post ? `${post.title}\n` : ''}${postUrl(id)}``.
  - TopBar `right` = `<Menu accessibilityLabel="더 보기" actions={[…]}>` around a plain `View` with the `more` icon. Actions:
    - `{ key: 'share', label: '공유하기', systemImage: 'square.and.arrow.up', onPress: () => void shareMessage({ message: postShareMessage(id, post) }) }`
    - `{ key: 'copy', label: '링크 복사', systemImage: 'link', onPress: () => void copyText(postUrl(id)).then(() => showToast({ message: '링크를 복사했어요' })) }`
- Tests: `postShareMessage puts the title above the post URL`, `postShareMessage without a post is the URL`.
- Done when: `더 보기` shows both actions on both platforms, share opens the share sheet, and copy shows the toast. Verify passes. Needs design pass: the trigger's glass look.

## FE-A-09 Search sort: typed hook, no visible change yet
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/search-sort-hook`
- Depends on: FE-A-01. The visible menu waits for the BE "search sort param" item (STATUS backend list).
- Files: `src/features/search/{constants.ts,types.ts}` (create `types.ts` if missing, and export it), `src/features/search/api/fetchers.ts`, `src/features/search/api/hooks.ts`, `src/screens/search/search-screen.tsx`
- Design: 02-Home › 검색 · 결과 (`관련도순 ⌄`)
- Logic design:
  - `export type SearchSort = 'relevance'`.
  - `export const SEARCH_SORTS: { key: SearchSort; label: string }[] = [{ key: 'relevance', label: '관련도순' }]`.
  - Search hooks take `sort: SearchSort` and include it in the queryKey.
  - The fetcher does not send it, with this line: `// shortcut: push-be /search ranks by relevance only and has no sort param; send sort once it does.`.
  - The screen keeps `const [sort, setSort] = useState<SearchSort>('relevance')`. On the postings tab it renders `SEARCH_SORTS.length > 1 ? <Menu …selected…> : <current static label>`.
  - When BE adds a value, extend the union and the list, and send the param.
- Tests: none (no behaviour change).
- Done when: typecheck passes and the screen looks the same.

## FE-A-10 내 프로필 buttons and PDF로 내보내기
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/profile-pdf-export`
- Depends on: FE-A-01. push-be `POST /documents/{id}/exports` and `GET /documents/{id}/versions/{versionId}/export` are both on develop.
- Files:
  - `packages/api-client/src/types.ts`: add `applicationId: string | null; latestVersionId: string | null` to `ResumeDocument` (both are in the contract). Add `DocumentExport = { id: string; documentId: string; versionId: string; format: 'PDF' | 'DOCX'; status: 'READY_TO_RENDER' | 'SUCCEEDED' | 'FAILED' }` and `DocumentExportResult = { sha256: string; byteLength: number; pageCount?: number | null; status: 'SUCCEEDED' | 'FAILED'; errorCode?: string | null }`.
  - `packages/api-client/src/endpoints.ts` `documents`:
    - `createExport: (id, body: { versionId: string; format: 'PDF' | 'DOCX'; rendererVersion: string }) => unwrap(c.post<DataEnvelope<DocumentExport>>(`documents/${id}/exports`, { body }))`
    - `exportResult: (id, exportId, body: DocumentExportResult) => unwrap(c.post<DataEnvelope<DocumentExport>>(`documents/${id}/exports/${exportId}/result`, { body }))`
    - `exportFile: async (id, versionId, query: { format: 'PDF' | 'DOCX'; photo?: '1' }) => new Uint8Array(await (await c.raw('GET', `documents/${id}/versions/${versionId}/export`, { query })).arrayBuffer())`
  - `apps/fo-web/src/pages/profile/profile-pdf.ts` (new) and `profile-pdf.test.ts`: `pickProfileDocument(docs: ResumeDocument[]): { documentId: string; versionId: string } | null`. It returns the newest `updatedAt` doc with `kind === 'HUB_PROFILE'`, `applicationId == null` and `latestVersionId != null`. Include this line: `// shortcut: a profile only edited by hand has no HUB_PROFILE document (no button) and a document can be older than later edits; switch to a BE export of the profiles row when it exists.`
  - `apps/fo-web/src/pages/profile/profile-page.tsx`: when the profile is `mine`, `PROFILE_EDITS` becomes only `{ section: 'basic', label: '기본 정보 편집' }`. Add a `PDF로 내보내기` button, rendered only when `pickProfileDocument(...)` is not null, that calls `send({ type: 'profile-pdf', documentId, versionId, name: p.displayName })`. Fetch the doc list with `GET /documents?kind=HUB_PROFILE&limit=20`, enabled only when `mine`, the same way fo-web's existing entities call the API.
  - `src/shared/components/detail-web-view.tsx`: add an optional prop `onBridge?: (m: Record<string, unknown>) => void`, called for any `type` the component doesn't already handle.
  - `src/shared/infrastructure/platform.ts` and `index.ts`: add `sha256Hex(bytes: Uint8Array): Promise<string>` using expo-crypto `digest(CryptoDigestAlgorithm.SHA256, bytes)` → lowercase hex.
  - `src/features/hub/constants.ts`: `PROFILE_PDF_RENDERER = 'ai-export'`. `src/features/hub/utils/share-message.ts` or a new `utils/pdf-name.ts`: `profilePdfName(name) => `${name.replace(/[\\/:*?"<>|]/g, '').trim() || 'Push'}_프로필.pdf``.
  - `src/features/hub/api/{fetchers.ts,hooks.ts}`: add `useExportProfilePdf()`.
  - `src/screens/hub/profile-detail-screen.tsx`: `onBridge={(m) => self && m.type === 'profile-pdf' && typeof m.documentId === 'string' && typeof m.versionId === 'string' && !exportPdf.isPending && exportPdf.mutate({ documentId: m.documentId, versionId: m.versionId, name: typeof m.name === 'string' ? m.name : '' })}`.
- Design: 11-Hub › 허브 프로필 상세 · 내 프로필
- Logic design: the mutation runs these steps, with no polling.
  1. `showToast({ message: 'PDF를 만들고 있어요' })`.
  2. `exp = await api.documents.createExport(documentId, { versionId, format: 'PDF', rendererVersion: PROFILE_PDF_RENDERER })`. The response is 201. A 422 `DOCUMENT_NOT_FINALIZED` means the doc is not the latest version, and it goes to the error path.
  3. `bytes = await api.documents.exportFile(documentId, versionId, { format: 'PDF', photo: '1' })`.
  4. `uri = await saveToCache(profilePdfName(name), bytes)`, then `await shareFile(uri, 'PDF로 내보내기')`.
  5. Fire and forget: `api.documents.exportResult(documentId, exp.id, { sha256: await sha256Hex(bytes), byteLength: bytes.byteLength, status: 'SUCCEEDED' }).catch(() => undefined)`.

  On an error after step 2:
  - Fire and forget `exportResult(…, { sha256: 'none', byteLength: 0, status: 'FAILED', errorCode: e instanceof ApiError ? e.code : 'DOWNLOAD_FAILED' })`. Note that `sha256` has `minLength 1`.
  - Then `showToast({ message: 'PDF를 만들지 못했어요. 잠시 후 다시 해 주세요.' })`.

  On an error in step 2, only the toast runs.
- Tests:
  - fo-web `profile-pdf.test.ts`: `picks the newest base hub profile with a version`, `ignores application profiles`, `returns null without a version`.
  - fo-mobile `profilePdfName strips path characters`.
  - api-client: if `__tests__` has an endpoint path test, add the 3 paths.
- Done when:
  - Your own profile in the hub shows `기본 정보 편집`, plus `PDF로 내보내기` only for an account with a base HUB_PROFILE doc (use a staging account).
  - Tapping it opens the share sheet with a PDF.
  - The network log shows `POST …/exports` 201, `GET …/export` 200 and `POST …/result` 200.
  - Verify passes for fo-mobile, fo-web and api-client.
  - Needs design pass: the PDF button icon and progress feedback.

## FE-A-11 WebView follows the app theme
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/webview-theme`
- Depends on: FE-A-01. fo-web `tokens.css` already honours `data-theme` (STATUS).
- Files: `src/shared/components/detail-web-view.tsx`, `apps/fo-web/src/shared/lib/bridge.ts` (and its test file, or a new `bridge.test.ts`)
- Design: 04-공고-상세 and 11-Hub detail artboards, dark variants
- Logic design:
  - **App**:
    - `const mode = useThemeMode()`.
    - The boot object becomes `{ token, apiBaseUrl, mock, theme: mode }`, built from the first render's mode, like `token`.
    - `useEffect(() => ref.current?.injectJavaScript(`window.dispatchEvent(new CustomEvent('push:theme',{detail:{theme:${JSON.stringify(mode)}}}));true;`), [mode])`.
  - **fo-web bridge**:
    - `PushEnv.theme?: 'light' | 'dark'`.
    - `applyTheme(v: unknown)` sets `document.documentElement.dataset.theme` only for `'light' | 'dark'`.
    - On init it reads `window.__PUSH__?.theme`, and it listens for `push:theme` next to the existing `push:token` listener.
    - Outside a WebView, nothing changes.
- Tests: fo-web `applies the theme from __PUSH__`, `updates on push:theme`, `ignores unknown values`. If the vitest env has no DOM, test the pure guard `themeOf(v)` instead.
- Done when: switching 테마 to 다크 while a posting detail is open recolours the WebView without a reload. Verify passes for both apps.

## FE-A-12 Apply sheet: `함께 보낼 수 있어요` from `sources.kind`
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/apply-extra-sources`
- Depends on: FE-A-04, and push-be #222 merged with migration 0036 applied (owner)
- Files: `packages/api-client/src/types.ts` (`SourceItem.kind?: string | null`), `src/features/jobs/types.ts` (`ApplyDoc` gains `kind: string | null; date: string | null`), `src/features/jobs/utils/apply-doc.ts` and `apply-doc.test.ts`, `src/features/jobs/api/{fetchers.ts,hooks.ts}`, `src/screens/jobs/apply-sheet-screen.tsx`, `src/features/jobs/components/apply-sheet.tsx`
- Design: 04-공고-상세 › 채용공고 상세 · 지원 서류 고르기
- Logic design:
  - `splitApplyDocs(docs) => ({ main: docs.filter((d) => d.kind !== 'PORTFOLIO'), extras: docs.filter((d) => d.kind === 'PORTFOLIO') })`.
  - `main` stays a radio list, as today. `extras` rows toggle a `Set<string>`, with the row note `` `함께 보낼 수 있어요${d.date ? ` · ${monthDay(d.date)}` : ''}` ``.
  - `applyBody(main, extras) => ({ documentIds: [main, ...extras].filter((d) => d?.ai).map((d) => d.id), sourceIds: [main, ...extras].filter((d) => d && !d.ai).map((d) => d.id) })`. `applyToPosting(postingId, body)` calls `api.postings.apply(postingId, body.documentIds, body.sourceIds)`.
  - Delete the floating `함께 보낼 수 있어요` line. While the server returns `kind: null`, `extras` is empty and nothing extra renders.
- Tests: `splitApplyDocs puts portfolios into extras`, `applyBody sends AI docs as documentIds and uploads as sourceIds`.
- Done when: with #222 on staging, a PORTFOLIO upload shows as a toggle row, and applying sends it in `sourceIds`. Verify passes.

## FE-A-13 Filter chip text rule
- Kind: design
- Branch: `feat/main-tabs-design` → `chore/jobs-chip-labels`
- Depends on: FE-A-01
- Files: `src/features/jobs/utils/filters.ts` (`chipText`), `packages/api-client/src/labels/chip-label.ts` only if needed, `src/features/jobs/utils/filters.test.ts`
- Design: 03-채용공고 › 채용공고 · 경력 필터 (`경력 4–6년`), 직군 필터 (`개발 외 1`), 고용형태 필터 (`정규직`)
- Logic design: when values are selected, the career chip shows `경력 ${label}` (for example `경력 4–6년`, `경력 4–6년 외 1`). All other kinds show their value text only. With nothing selected, every chip shows its title (`경력` and so on). `전체` stays on only when `isEmpty(filters)`.
- Tests: `career chip keeps the 경력 prefix`, `category chip shows the value only`.
- Done when: the chips match the three artboards. Verify passes.

## FE-A-14 Fit card FREE state (fo-web, shown in 공고 상세)
- Kind: design
- Branch: `feat/main-tabs-design` → `chore/fit-card-free`
- Depends on: FE-A-01
- Files: `apps/fo-web/src/pages/posting/fit-card.tsx`, `apps/fo-web/src/pages/posting/fit-view.ts` (only if the copy constant moves), `apps/fo-web/src/styles.css`
- Design: 04-공고-상세 › 채용공고 상세 (FREE variant)
- Logic design:
  - FREE renders the 5 part rows, using `–` where there is no score, inside a wrapper with `filter: blur(5px); opacity: .55; pointer-events: none` and `aria-hidden`.
  - It overlays the pill `🔒 PRO로 올리면 항목별 점수와 약점을 볼 수 있어요`.
  - Remove the h3 subtitle version of that line.
  - PRO and ULTRA are unchanged.
- Tests: the existing `fit-view.test.ts` passes.
- Done when: the FREE account matches the artboard in the app WebView. fo-web verify passes.

## FE-A-15 Terms `자세히 보기` links (blocked)
- Kind: logic
- Branch: `feat/main-tabs-design` → `feat/terms-links`
- Depends on: the owner supplying legal URLs, and FE-W legal pages at `/legal/terms`, `/legal/privacy`, `/legal/marketing`
- Files: `src/features/auth/constants.ts` (`TERM_ROWS[].path?`), `src/features/auth/components/term-row.tsx`
- Design: 01-Auth › 가입 · 약관 동의
- Logic design:
  - The rows `service`, `privacy` and `marketing` get a `path`. `age14` has none.
  - `TermRow` shows a right chevron button, 44×44, with `accessibilityLabel={`${label} 자세히 보기`}` that calls `openBrowser(`${WEB_BASE_URL}${path}`)`.
  - Tapping the label still toggles the checkbox.
- Tests: none (wiring).
- Done when: each chevron opens its page in the in-app browser.

## FE-A-16 Design pass on A's new native surfaces and large text
- Kind: design
- Branch: `feat/main-tabs-design` → `chore/main-tabs-native-design`
- Depends on: FE-A-02 through FE-A-10
- Files: the sheet screens and bodies from A-02, A-04, A-05 and A-06, `src/screens/jobs/job-list-screen.tsx` (sort trigger), `src/screens/social/post-detail-screen.tsx` (more trigger), `src/screens/social/compose-screen.tsx` (category row), `src/features/hub/components/proposal-sheet.tsx`, `apps/fo-web/src/pages/profile/profile-page.tsx`, home cards and shortcuts
- Design: every artboard named in A-02 through A-10; 02-Home › 홈 · 큰 글씨; 04-공고-상세 › 채용공고 상세 · 큰 글씨
- Logic design: no logic changes. Items:
  - Sheet header rows match `sheet2`. `Sheet` already draws the grabber or handle, so add no close X.
  - The proposal `함께 보낼 공고` chips wrap (`flexWrap`) instead of scrolling sideways, each with its logo square. The title is `b2 w7`.
  - The sort trigger is `c1 600 t2` plus a chevron.
  - The `더 보기` trigger has the glass circle look.
  - The PDF button gets its icon.
  - Use `minHeight` instead of a fixed `height` where large text clips (job cards 200×136, shortcuts 100px).
- Tests: none.
- Done when: the PR has iOS light, iOS dark and Android light screenshots for each listed artboard, and verify passes.

## FE-A-17 #139 wrap-up: Maestro and PR body
- Kind: logic
- Branch: `feat/main-tabs-design`
- Depends on: all FE-A tasks that have landed
- Files: `.maestro/flows/0*.yaml` (selectors only), PR #139 body
- Design: none
- Logic design:
  - Run flows 00–06 on the iOS simulator (simslim) and an Android emulator against the mock API.
  - The PR body lists:
    - "Depends on #143 (merged in), #138 (merged in)".
    - The routes and stores from the Decisions table.
    - "Needs design pass".
    - Blocked items: A-12 (#222), A-15 (legal URLs), and the search sort menu (BE param).
- Tests: Maestro.
- Done when: every flow is green on iOS and Android, or each failure is listed with its cause, and the PR body is updated.

---

## FE-B-01 Confirm store and `confirm` route
- Kind: logic
- Branch: `feat/my-design` → `feat/my-confirm-route`
- Depends on: #143 (merged in)
- Files:
  - New: `src/shared/components/confirm-store.ts`, `src/shared/components/__tests__/confirm-store.test.ts`, `src/screens/common/confirm-sheet-screen.tsx`, `src/app/confirm.tsx`, `src/app/(tabs)/(my)/confirm.tsx`.
  - Modified: `src/shared/components/index.ts`, `src/app/_layout.tsx`, `src/app/(tabs)/(my)/_layout.tsx`, `src/features/my/hooks.ts` (`useUndoRemove`), `src/features/my/components/index.ts`, `src/features/my/components/docs-tab.tsx`, `src/screens/my/doc-viewer-screen.tsx`, `src/screens/my/edit-profile-screen.tsx` (career delete), `src/screens/my/push-doc-screen.tsx` (기본 프로필로 설정).
  - Deleted: `src/features/my/components/confirm-sheet.tsx` and the `DeleteDocSheet` component and export.
- Design: 14 마이-서류 › 마이 · 서류 · 삭제 확인; 13 마이-프로필 › 프로필 편집 · 경력 · 삭제 확인; 14 마이-서류 › 지원 서류용 프로필 · 기본 프로필로 설정 확인
- Logic design:
```ts
export type ConfirmRequest = { title: string; body: string; confirm: string; cancel?: string; danger?: boolean; onConfirm: () => void }
export type ConfirmHref = '/confirm' | '/(tabs)/(my)/confirm'
type ConfirmState = { request: ConfirmRequest | null; set: (request: ConfirmRequest | null) => void }
export const useConfirmStore = create<ConfirmState>()((set) => ({ request: null, set: (request) => set({ request }) }))
export const askConfirm = (request: ConfirmRequest, href: ConfirmHref = '/confirm') => {
  useConfirmStore.getState().set(request)
  router.push(href)
}
```
  - **Screen**:
    - `request = useConfirmStore((s) => s.request)`. When it is null, call `router.back()` in an effect and render `null`.
    - On unmount, `useConfirmStore.getState().set(null)`.
    - Inside `<Sheet>`: a `View accessibilityRole="alert"` with the title (`h3`, header) and body (`b2 t2`), then a row with `cancel ?? '취소'` (secondary, `router.back()`) and `confirm` (`danger ? 'danger' : 'primary'`), which runs `router.back(); request.onConfirm()`.
    - Swiping down calls nothing.
  - **Register** `confirm` with `sheetOptions(c)` in both the root `_layout.tsx` and `(tabs)/(my)/_layout.tsx`. `TabStack` reads `useColors()`.
  - **Which href**: screens inside the (my) stack modal (`edit-profile/[section]`) pass `'/(tabs)/(my)/confirm'`. Every other screen uses the default.
  - **Migrations**:
    - 서류 삭제: in `useUndoRemove`, delete `asking`, `open` and `cancel`. `ask(doc)` becomes `askConfirm({ ...<existing delete-doc confirm copy for doc.fileName>, danger: true, onConfirm: () => confirm(doc) })`, where `confirm(doc)` is the existing hide → undo toast → 2.5 s timer → `remove.mutate` logic, now taking `doc` as an argument.
    - 경력 삭제: `askConfirm({ title: '이 경력을 삭제할까요?', body: <existing my-rules career body>, confirm: '삭제', danger: true, onConfirm: () => <existing remove + undo toast for index i> }, '/(tabs)/(my)/confirm')`. Drop the `removing` and `asking` state.
    - 기본 프로필로 설정: `askConfirm({ <existing copy>, confirm: '설정', onConfirm: () => setBase.mutate(…) })`. Drop the `asking` state.
    - Keep `SHEET_SWAP_MS` only if something still uses it.
- Tests: `confirm-store.test.ts`, with expo-router mocked: `askConfirm stores the request and pushes /confirm`, `askConfirm pushes the given href`, `set(null) clears the request`.
- Done when:
  - All 3 confirms open as native sheets (grabber on iOS, handle on Android).
  - Confirming runs the action after the sheet closes, and swiping cancels.
  - `rg -n "ConfirmSheet|DeleteDocSheet" apps/fo-mobile/src` returns nothing.
  - Verify passes.

## FE-B-02 서류 ⋯ as a native Menu
- Kind: logic
- Branch: `feat/my-design` → `feat/doc-menu-native`
- Depends on: FE-B-01
- Files: `src/features/my/components/doc-menu.tsx`, `src/features/my/components/docs-tab.tsx`, `src/screens/my/doc-viewer-screen.tsx`
- Design: 14 마이-서류 › 마이 · 서류 · 상태 (⋯)
- Logic design:
  - `DocMenu = ({ doc, viewing, onDelete, children }: { doc: Pick<MySource,'id'|'fileName'>; viewing?: boolean; onDelete: () => void; children: ReactElement })` renders `<Menu accessibilityLabel={`${doc.fileName} 더 보기`} actions={[...(viewing ? [] : [{ key: 'open', label: '서류 보기', systemImage: 'doc.text', onPress: () => router.push(`/docs/${doc.id}`) }]), { key: 'delete', label: '서류 삭제하기', systemImage: 'trash', destructive: true, onPress: onDelete }]}>`.
  - In docs-tab, each row's ⋯ `Pressable` becomes a `View` inside `DocMenu`. Drop the `menu` state.
  - In doc-viewer, the TopBar `right` = `GlassButton` (share only) plus `DocMenu viewing` wrapping a glass `more` View. Drop the `menu` state.
  - `onDelete = () => undo.ask(doc)`.
- Tests: none (wiring).
- Done when: ⋯ opens an iOS pull-down or Android dropdown, and `서류 삭제하기` opens the confirm sheet. Verify passes.

## FE-B-03 서류 가져오기 route `docs/import`
- Kind: logic
- Branch: `feat/my-design` → `feat/doc-import-sheet`
- Depends on: FE-B-01 (`_layout.tsx` order)
- Files:
  - New: `src/features/my/stores.ts`, `src/features/my/stores.test.ts`, `src/screens/my/doc-import-sheet-screen.tsx`, `src/app/docs/import.tsx`.
  - Modified: `src/features/my/index.ts`, `src/features/my/components/docs-tab.tsx`, `src/app/_layout.tsx`.
- Design: 14 마이-서류 › 마이 · 서류 가져오기
- Logic design:
```ts
type DocImportState = { file: PickedFile | null; setFile: (file: PickedFile | null) => void }
export const useDocImportStore = create<DocImportState>()((set) => ({ file: null, setFile: (file) => set({ file }) }))
```
  - `PickedFile` is the asset type `useUpload().start()` takes today.
  - **Sheet**, `fitToContents`, rows as today:
    - `파일에서 고르기`: `const r = await pickDocument(RESUME_DOCUMENT_OPTIONS); if (r.canceled || !r.assets[0]) return; setFile(r.assets[0]); router.back()`. It picks before dismissing, so the picker never presents during a dismissal.
    - `에이전트로 새로 만들기`: `router.back()`, then the existing start-chat action.
  - **docs-tab**:
    - The `파일 등록` and empty-state buttons call `router.push('/docs/import')`.
    - `useEffect` on `file`: `setFile(null)`, then the existing size check (`toast.fail(SIZE_LIMIT.title)` over 20 MB), then `start(file)`.
    - Split the current `pickFile` into the picker part, which moves to the sheet, and `startFile(file)`.
    - Drop the `picking` state.
- Tests: `stores.test.ts`: `setFile stores and clears the picked file`.
- Done when: picking a PDF from the sheet closes it and starts the progress row in 서류. A file over 20 MB shows the error toast. Verify passes.

## FE-B-04 내 프로필로 전환 route `docs/[id]/to-profile` (202 and job polling)
- Kind: logic
- Branch: `feat/my-design` → `feat/to-profile-sheet`
- Depends on: FE-B-01
- Files:
  - New: `src/screens/my/to-profile-sheet-screen.tsx`, `src/app/docs/[id]/to-profile.tsx`, `src/features/my/utils/job-outcome.ts` (and export it).
  - Modified: `src/features/my/utils/lib.test.ts`, `src/features/my/api/hooks.ts` (`useConvertDocument` no longer navigates or alerts), `src/screens/my/doc-viewer-screen.tsx` (delete `ToProfileSheet` and the `sheet` state; the button calls `router.push(`/docs/${id}/to-profile`)`), `src/app/_layout.tsx` (`docs/[id]/to-profile` with `sheetOptions(c)`).
- Design: 14 마이-서류 › 마이 · 서류 → 내 프로필로 전환
- Logic design:
  - `jobOutcome(job?: QueueJob): 'wait' | 'done' | 'failed'`: `DONE` → done; `FAILED`, `DEAD` or `CANCELLED` → failed; anything else, or undefined → wait.
  - **Screen state**: `jobId` and `documentId` in `useState`, `job = useQuery(ingestJobQuery(jobId))` (the existing query factory).
    - **Idle**: the current title, description and action label.
    - **convert 200** `{ documentId }`: invalidate `['documents']`, then `router.back(); router.push(`/docs/push/${documentId}`)`.
    - **convert 202** `{ documentId, jobId }`: store both and keep the sheet open. The action label becomes `만드는 중`, disabled, with an `ActivityIndicator`.
    - When `jobOutcome` is `done`: invalidate `['documents']`, then `router.back()` and `router.push(`/docs/push/${documentId}`)`.
    - When it is `failed` or the mutation errors: show the inline red line `지원 서류용 프로필을 만들지 못했어요. 다시 시도해 주세요.` (Needs design pass). The action is re-enabled and retrying clears `jobId` and converts again.
  - **Dismiss during polling**: the query unmounts and nothing navigates. The server finishes, and the doc appears in Push 서류.
  - Keep push-doc-screen's `jobId` handling for deep links, unchanged.
  - The section checklist is out of scope (BE section picking; see "Waiting on BE").
- Tests: `jobOutcome DONE is done`, `jobOutcome FAILED DEAD CANCELLED are failed`, `jobOutcome QUEUED RUNNING RETRY and undefined wait`.
- Done when: a PDF upload (202) keeps the sheet showing `만드는 중` until the job is done, then opens the new Push 서류. A text upload (200) opens it at once. A failed job shows the error with retry. Verify passes.

## FE-B-05 수락 reply route `offers/[id]/reply`
- Kind: logic
- Branch: `feat/my-design` → `feat/offer-reply-sheet`
- Depends on: FE-B-01
- Files:
  - New: `src/screens/my/offer-reply-sheet-screen.tsx`, `src/app/offers/[id]/reply.tsx`.
  - Modified: `src/screens/my/offer-detail-screen.tsx` (delete the `BottomSheet`, `replying` and `reply`; `수락하고 답장하기` calls `router.push(`/offers/${id}/reply`)`), `src/app/_layout.tsx`.
- Design: 16 마이-제안함 › 제안함 · 상태 (수락 시트, 수락 · 보내는 중)
- Logic design:
  - Param `id`. `o = useOffer(id).data`, and the name is the received counterpart (`o.sender.displayName`).
  - `const [reply, setReply] = useState('')`.
  - `const { accept } = useOfferDecision(id, reply, () => router.back())`. If `done(next)` inside `useOfferDecision` navigates, make it run after `router.back()`.
  - The `Sheet` keeps the current title, description, placeholder and action (`수락하고 보내기` / `보내는 중`), disabled when `!reply.trim() || accept.isPending`.
  - Detents `fitToContents`. Check that the Android keyboard leaves the action visible, and report it in the PR if not.
- Tests: none (wiring).
- Done when: accepting with a reply closes the sheet and the offer shows 수락함. Maestro `07_my_offer_messages.yaml` still passes. Verify passes.

## FE-B-06 Settings: `settings/pick` route, theme SegmentedControl, language Menu
- Kind: logic
- Branch: `feat/my-design` → `feat/settings-native`
- Depends on: FE-B-01
- Files:
  - New: `src/screens/my/settings-pick-sheet-screen.tsx`, `src/app/settings/pick.tsx`.
  - Modified: `src/features/my/constants.ts`, `src/screens/my/settings-screen.tsx` (delete `PickSheet`, the `LanguageSelect` Modal and Glass popover, and the `sheet` state), `src/app/_layout.tsx`.
- Design: 17 마이-설정 › 마이 · 설정; 설정 · 언어 선택; 마이 · 설정 · 상태 (연락처 공개, 기본 말투)
- Logic design:
  - `SETTINGS_PICKS = { contact: { title: <current 연락처 title>, items: CONTACT, field: 'contactVisibility' }, tone: { title: <current 말투 title>, items: TONES, field: 'defaultTone' } } as const`. Param `field` is `'contact' | 'tone'`.
  - **Pick screen**:
    - `const { s, set } = useSettings()`.
    - Rows are the current PickSheet rows (radio, check), inside `<Sheet title>`.
    - Tapping a row runs `set({ [field]: key }); router.back()`.
    - `fitToContents`.
  - **Settings rows** call `router.push({ pathname: '/settings/pick', params: { field: 'contact' } })` (or `'tone'`).
  - **Theme**: `<SegmentedControl items={THEME_CHOICES} value={theme} onChange={setTheme} />`.
  - **Language**: `<Menu accessibilityLabel={`언어 선택, ${label}`} actions={LANGS.map((l) => ({ key: l.key, label: l.label, selected: l.key === s.locale, onPress: () => set({ locale: l.key }) }))}>` around the current pill, which becomes a `View`.
- Tests: none (wiring).
- Done when: both pickers open as native sheets and save. The theme segments switch instantly. Language opens a native menu with a check. Maestro `05_my_settings_logout.yaml` passes. Verify passes.

## FE-B-07 Profile edit: 직군·연차 Menu and 경력 month DatePicker
- Kind: logic
- Branch: `feat/my-design` → `feat/edit-profile-native`
- Depends on: none (separate files). Land it after B-01 because both edit `edit-profile-screen.tsx`.
- Files: `src/screens/my/edit-profile-screen.tsx`, `src/features/my/utils/parse-ym.ts`, `src/features/my/utils/lib.test.ts`
- Design: 13 마이-프로필 › 프로필 편집 · 기본 정보; 프로필 편집 · 경력; 프로필 편집 · 경력 · 상태
- Logic design:
  - **직군**: a `Menu` over the 직군 field `View`, with actions `JOB_CATEGORIES` (`selected` on the current one) that call `setJob(key)`.
  - **연차**: the same, with `YEARS` (21 items; native menus scroll).
  - Delete the local `PickSheet` and the `sheet` state.
  - `ymToDate(text: string): Date | null` uses `parseYm` and returns `new Date(y, m - 1, 1)`. `dateToYm(d: Date): string` returns `YYYY.MM`.
  - **Start**: `<DatePicker label="시작" mode="month" value={ymToDate(it.start)} max={new Date()} onChange={(d) => set(i, { start: dateToYm(d) })} />`.
  - **End**, only while not current: `<DatePicker label="종료" mode="month" value={ymToDate(it.end)} min={ymToDate(it.start) ?? undefined} max={new Date()} onChange={(d) => set(i, { end: dateToYm(d) })} />`.
  - The draft stays a `YYYY.MM` string, so validation and save are unchanged. A null value stays empty until the user picks, and the "채워 주세요" validation still fires.
- Tests: `ymToDate parses 2022.03 to March 2022`, `ymToDate returns null for empty text`, `dateToYm pads the month`.
- Done when: start and end open a native month picker on both platforms. Saving writes `YYYY-MM` as before. 직군 and 연차 open native menus. Verify passes.

## FE-B-08 일정 추가 route `activity/add-event`
- Kind: logic
- Branch: `feat/my-design` → `feat/add-event-sheet`
- Depends on: FE-B-01
- Files:
  - New: `src/screens/my/add-event-sheet-screen.tsx`, `src/app/activity/add-event.tsx`, `src/features/my/utils/day-param.ts` (and export it).
  - Modified: `src/features/my/utils/lib.test.ts`, `src/features/my/constants.ts` (move `TYPES` there from calendar-view as `EVENT_TYPES`), `src/features/my/components/calendar-view.tsx` (delete `AddEvent` and the `adding` state; `일정 추가` calls `router.push({ pathname: '/activity/add-event', params: { day: toDayParam(selected) } })`), `src/app/_layout.tsx`.
- Design: 15 마이-내-활동 › 마이 · 내 활동 · 캘린더 · 상태 (일정 추가 시트)
- Logic design:
  - `toDayParam(d) => 'YYYY-MM-DD'` from local date parts. `fromDayParam(s) => Date | null` gives local midnight, or null for bad input, in which case the screen calls `router.back()`.
  - State: `title ''`, `type 'INTERVIEW'`, `date = fromDayParam(day)`, `time = new Date(date with 09:00)`.
  - Fields: the 일정 이름 TextField, type chips (`EVENT_TYPES`), `<DatePicker label="날짜" mode="date" value={date} onChange={setDate} />` and `<DatePicker label="시간" mode="time" value={time} onChange={setTime} />`.
  - Delete the old description line (`M월 D일 오전 9:00`).
  - The action `일정 추가하기` is disabled when `!title.trim() || add.isPending`. It calls `add.mutate({ type, title: title.trim(), startsAt: withTime(date, time).toISOString() })` (`withTime` from `@/shared/utility`).
  - On success, `router.back()`; the hook already invalidates `['calendar']`.
  - On error, show the inline line `일정을 추가하지 못했어요. 잠시 후 다시 해 주세요.` (Needs design pass).
  - The location field comes with FE-B-10.
- Tests: `toDayParam pads month and day`, `fromDayParam round-trips toDayParam`, `fromDayParam rejects bad input`.
- Done when: an event added for a chosen date and time shows on that day at that time, and the default type is 면접. Verify passes.

## FE-B-09 Top-bar ⋯ menus on Push 서류 and 제안 메시지
- Kind: logic
- Branch: `feat/my-design` → `feat/my-topbar-menus`
- Depends on: FE-B-01
- Files: `src/screens/my/push-doc-screen.tsx`, `src/screens/my/offer-messages-screen.tsx`, `src/features/my/api/{fetchers.ts,hooks.ts}` (`archiveDocument`, `useArchiveDocument`), and the push-doc document type (add `revision: number` if it is missing; it is `Document.revision` in the contract)
- Design: 14 마이-서류 › 마이 · Push 서류 보기 (페이지) (top 더 보기); 16 마이-제안함 › 마이 · 제안 메시지 (top 더 보기)
- Logic design:
  - **Push 서류 ⋯** (`Menu`) actions:
    - `공고 보기`, only when there is an application: `router.push(`/postings/${application.jobId}`)`.
    - `보관하기` (destructive): `askConfirm({ title: '이 서류를 보관할까요?', body: '보관한 서류는 Push 서류 목록에서 사라져요.', confirm: '보관', danger: true, onConfirm: () => archive.mutate() })`.

    `useArchiveDocument(id)` calls `POST /documents/{id}/archive` with `{ expectedRevision: doc.revision }`. On success it invalidates `['documents']`, then runs `router.back()` and `showToast({ message: '서류를 보관했어요' })`. On a 409 `REVISION_CONFLICT`, refetch the doc and `showToast({ message: '잠시 후 다시 해 주세요' })`.
  - **제안 메시지 ⋯** actions:
    - `허브 프로필 보기`: `router.push(`/profiles/${who.id}`)`.
    - `제안 내용 보기`: `router.push(`/offers/${id}?box=${box}`)`.
  - All copy here is provisional (the design has no menu content) and goes in Needs design pass.
- Tests: none (wiring).
- Done when: both menus work on both platforms, and archiving removes the doc from the Push 서류 list. Verify passes.

## FE-B-10 Fields from push-be #222: stage times, event location, source kind
- Kind: logic
- Branch: `feat/my-design` → `feat/my-design-api-fields`
- Depends on: push-be #222 merged with migration 0036 applied (owner), and FE-B-08
- Files: `packages/api-client/src/types.ts` (`Application.stageEnteredAt?: Partial<Record<ApplicationStage, string>>`, `CalendarEvent.location?: string | null`, `SourceItem.kind?: string | null` shared with A-12), `src/screens/my/application-detail-screen.tsx` (stage tracker), `src/features/my/components/calendar-view.tsx` (`subline`), `src/screens/my/add-event-sheet-screen.tsx`, `src/features/my/api/fetchers.ts` (`addEvent` body), `src/features/my/utils/` (`stage-dates.ts`) and `lib.test.ts`
- Design: 15 마이-내-활동 › 마이 · 내 활동 · 지원한 공고 상세 (tracker 10.14/10.17/10.21); 15 › 마이 · 내 활동 · 캘린더 (`Google Meet · 1시간`)
- Logic design:
  - `stageDates(app) => Record<stage, 'MM.DD' | null>` from `stageEnteredAt`, with null when it is missing (the old server).
  - `subline = [e.location, duration, e.notes].filter(Boolean).join(' · ')`.
  - The add-event sheet gets an optional `장소` TextField (max 200) that sends `location`, or omits it when empty.
- Tests: `stageDates formats entered stages as MM.DD`, `stageDates is null without stageEnteredAt`, `subline puts location first`.
- Done when: on staging with #222, the tracker shows dates and events show their location. On the old server nothing breaks. Verify passes.

## FE-B-11 고객센터 / 약관 및 정책 links (blocked)
- Kind: logic
- Branch: `feat/my-design` → `feat/settings-links`
- Depends on: the owner supplying support and legal URLs, and FE-W pages (same as FE-A-15)
- Files: `src/features/my/constants.ts` (`SUPPORT_PATH = '/support'`, `LEGAL_PATH = '/legal'`), `src/screens/my/settings-screen.tsx` (remove the `shortcut:` line)
- Design: 17 마이-설정 › 마이 · 설정
- Logic design: each row's `onPress` calls `openBrowser(`${WEB_BASE_URL}${path}`)`.
- Tests: none.
- Done when: both rows open their pages.

## FE-B-12 Design pass on 마이's new native surfaces and large text
- Kind: design
- Branch: `feat/my-design` → `chore/my-native-design`
- Depends on: FE-B-01 through FE-B-09
- Files: the sheet screens from B-01, B-03, B-04, B-05, B-06 and B-08, `src/screens/my/edit-profile-screen.tsx`, `src/screens/my/settings-screen.tsx`, `src/features/my/components/docs-tab.tsx`
- Design: every artboard named in B-01 through B-09
- Logic design: no logic changes. Items:
  - The confirm sheet matches `sheet2 role=alertdialog`.
  - The 서류 가져오기 rows have icons.
  - The DatePicker fields show `10월 23일 (금)` and `오후 2:00` the way the design draws them.
  - The settings pick rows match.
  - The menu triggers (language pill, 직군 and 연차 fields, ⋯ icons) keep their look.
  - The career error line moves below the fields, and the period line stays.
  - Use `minHeight` where large text clips.
  - The to-profile description stays the current copy until the section checklist exists. The design copy promises picking sections, which is not built.
- Tests: none.
- Done when: the PR has iOS light, iOS dark and Android light screenshots for each artboard, and verify passes.

## FE-B-13 #140 wrap-up: Maestro and PR body
- Kind: logic
- Branch: `feat/my-design`
- Depends on: all FE-B tasks that have landed
- Files: `.maestro/flows/05_my_settings_logout.yaml`, `06_my_application_detail.yaml`, `07_my_offer_messages.yaml` (selectors only), PR #140 body
- Design: none
- Logic design:
  - Run flows 00–07 on iOS and Android. 06 and 07 have never had a valid run.
  - The PR body lists:
    - "Depends on #137, #143 (merged in)".
    - The routes and stores from the Decisions table.
    - "Needs design pass".
    - Blocked items: B-10 (#222) and B-11 (URLs).
- Tests: Maestro.
- Done when: every flow is green on iOS and Android, or each failure is listed with its cause, and the PR body is updated.

---

## Waiting on BE (no FE task until the BE work lands)
- Search sort param, for the A-09 menu.
- Post update and delete, for 게시물 상세 더 보기 on your own posts.
- A PDF export of the `profiles` row, so A-10 also works for profiles edited only by hand.
- Section picking for 서류→프로필, for the B-04 checklist (`기본 정보 / 소개 / 경력 / 기술 스택`, the `N개 항목 반영하기` warning).
- Per-part fit on applications (the 지원한 공고 상세 fit card).
- Mobile document version writes (editing Push 서류 sections).
- Push 서류 share URL and source download URL (sharing files instead of file names).

Not in this file: the canvas audit rules (tab bar colours, selected ring, 48px touch targets) belong to FE-D. Agent sheets and menus belong to FE-C. fo-web screens other than the WebView pages above belong to FE-W.
