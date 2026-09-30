# 실험 카드: `home-greeting` — 홈 인사말

**코드**: `src/pages/home-page.tsx`

**목표**: 홈 화면 인사말 문구가 첫 대화 생성에 영향을 주는지 검증.

**변형**

| variant | 동작 |
|---|---|
| A (control) | `home.title` — "무엇을 도와드릴까요?" |
| B | `home.titleAlt` — "오늘은 뭘 밀어볼까요?" |

**지표**

| 이벤트 | 코드상 의미 |
|---|---|
| `exposure` | `useExperiment('home-greeting')` — `enrolled`일 때 홈 마운트 |
| `conversion` | 첫 메시지로 대화 생성 성공(`createConversation` 완료) |

가드레일 없음 — 카피 실험. `createConversation` 실패 시 conversion 미기록.
