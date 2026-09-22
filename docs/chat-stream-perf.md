# Chat stream performance

Plans: `_workspace/plans/A_chat-virtualization-anchor.md`, `_workspace/plans/C_incremental-markdown.md`.
Branch: `feat/chat-stream-perf`. Date: 2026-09-22. Env: Vitest + jsdom (`offsetHeight`/`clientHeight`/`scrollTop` mocked), so DOM numbers are structural, not layout-real.

## Implementation

- `components/chat-stream.tsx`: windowed rendering via `useVirtualRows` (top/bottom spacers), `memo` on `MessageView`, streaming bubble split into stable blocks + tail.
- `virtual-rows.ts`: row heights measured on mount + `ResizeObserver` (fallback: `offsetHeight` on mount), prefix-sum offsets, overscan window, anchor = first visible row restored in `useLayoutEffect` on prepend/measure changes. Active only when `count > CHAT_VIRTUAL_MIN_ROWS` (60).
- `markdown-split.ts`: `splitStableMarkdown` cuts at last blank line or closed fence; completed prefix rendered through `memo(Markdown)`, only the in-progress tail re-parses per flush.

## Measurements (before → after)

| Metric | Before | After |
| --- | --- | --- |
| Mounted `.chat-stream-row` nodes, 1,000 messages | 1000 | 10 |
| Prepend scroll error (50 prepended rows × 120px) | 6000px | 0px |
| Markdown calls, 500-token stream | 70 | 77 |
| Parsed chars, 500-token stream | 35,432 | ~9,000 |
| Real-parse bench render time (`actualDuration` sum, 500 tokens / ~9.7k chars) | 281ms | ~170–205ms |

Scroll commits stay bounded (`render-count.test.tsx`: 10 commits / 8 row renders over 8 scroll events; streaming adds zero committed-row re-renders).

## Tests

- `chat-stream-virtual.test.tsx`: window bound, prepend anchor (first visible row kept, `scrollTop` exact), tail rows reachable.
- `chat-stream-perf.test.tsx`: emits the metric table above as JSON.
- `incremental-markdown.test.tsx`: stable blocks parse once each; fence/table output identical after done.
- `markdown-split.test.ts`: blank line, fence (` ``` `/`~~~`), table boundaries.
- `stream-parse-bench.test.tsx`: real `react-markdown` render-time bench (no mock).
- `stream-render-rate.test.tsx`: extended with post-stream text identity.

Run: `npx vitest run src/features/chat/`
