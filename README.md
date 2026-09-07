# Push frontend

Tauri 2 + React + TypeScript. HTTP uses ky; Zustand owns runtime state. FSD v2.1 starts with `app`, page slices, and infrastructure in `shared`. The approval flow is a shared feature used across applications, documents, and projects.

## Local development

```sh
npm ci
npm run dev
```

Open the app's Settings, set the local API URL (`http://localhost:8080/api/v1`), and enter the development token configured on the backend. Tokens stay in memory and are never bundled, logged, or put into localStorage. Only the last account ID/server address is remembered for offline data access. Signing out clears that remembered account. Native application commands require `npm run tauri dev` and the Rust toolchain.

```sh
npm test
npm run check:fsd
npm run build
npm run tauri dev
```

Tests require Poppler (`pdftotext`, `pdftoppm`) and `unzip`. The optional real API export test uses externally supplied `DEV_AUTH_TOKEN` and optional `PUSH_API_URL`, and creates its own synthetic evidence/application/document:

```sh
PUSH_LIVE_EXPORT=1 npm test -- tests/live-export.test.ts tests/live-sync.test.ts tests/live-operation.test.ts
```

## Data and approvals

Each application owns separate documents and conversations. The editor persists a draft and its typed sync mutation in one account-scoped record. Native storage uses SQLite; browser previews use IndexedDB. Conflicts retain local content and require an explicit merge before a new version can be saved. Local cached records never authorize server actions. Application notes and internal calendar edits use a durable typed outbox with idempotent mutations, explicit conflict comparison, and incremental server change reception. Pins are persisted by the API. The operation panel restores pending operations and accepts requested input before resuming work.

Every evidence use is scoped to an application. Document finalization, manual submission recording, and CLI execution require separate target approvals. AI provider failures are displayed, never replaced with fake content. Source-excerpt generation can run without AI credentials.

PDFs embed the redistributable Nanum Gothic font; its SIL Open Font License is in `public/fonts/OFL.txt`. DOCX embeds NanumGothic and preserves Unicode text. Exports retain named links from TipTap, validate the actual generated text/links, then save and report the observed result. Native file selection cancellation is not reported as success.

## External validation

OAuth, real AI keys, Stripe billing, Google sync, production signing/notarization, and beta users require separately configured services. Browser previews cannot execute native CLI or copy project folders. The native job browser opens an isolated remote view and collects original text only after the user chooses the collection action. Do not treat these unverified external paths as a completed release.
