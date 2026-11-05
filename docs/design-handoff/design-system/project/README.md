Push is a Korean job app where an AI agent edits your 서류 to fit each 공고, alongside a hub of people and a small social feed. It runs on iOS 26, Android and a desktop app. The look borrows the calm, rounded clarity of Toss, the warmth of 당근 and Wanted's job focus, built on iOS Liquid Glass.

## Content fundamentals

- Write in short, friendly 존댓말 ending in ~요: "공고를 읽지 못했어요. 본문을 붙여넣어 주세요." Never 합니다체 and never 반말.
- Talk to the person, not about the system. Say what happened and what to do: "지원했어요. 내 활동에서 진행 상황을 볼 수 있어요."
- Buttons are verbs that name the result: "지원하기", "부족한 점 찾기", "ULTRA로 업그레이드". Never "확인" or "제출".
- Questions are how choices open: "어떤 공고와 비교할까요?", "이 변경을 이력서에 반영할까요?"
- Numbers over adjectives: "적합도 6.9 → 8.4", "필수 5개 · 우대 3개", "p99 420ms → 180ms".
- Use the app's own nouns: 공고, 서류, 허브, 제안, 내 활동, AI 채팅. Separate facts with " · ".
- No emoji in UI text. Agent progress verbs are casual and specific ("맞춰보는 중…", "끄적이는 중…").

## Visual foundations

- **Colour.** Mostly neutral. `bg` for screens, `bg2` for grouped lists and quiet cards, `fill` for controls. One brand colour, `ac` violet, for the primary action, selection and AI. Text: `t1` primary, `t2` secondary, `t3` metadata; `t4` only for placeholders. Status uses soft badges (`*-soft` + its colour): `red` urgent, `orange` waiting, `green` done.
- **Dark theme.** Every token has a dark value; `ac` brightens to #7464FF and accent text uses `ac-text` (#A69CFF).
- **Type.** Pretendard (Apple SD Gothic Neo / Noto Sans KR fallback), tight tracking (−0.02em; headings −0.03em). Scale: `h1` 26/36, `h2` 20/28, `h3` 17/24, `b1` 16/24, `b2` 15/22, `c1` 13/18, `c2` 12/16. Inputs never below 16px.
- **Spacing.** Screen gutter `space-5` (20px). Inner padding `space-4`. Chips and buttons in a row: `space-2`.
- **Radius.** Generous and consistent: `radius-md` for buttons and fields, `radius-lg` for groups and cards, `radius-xl` for sheets and the composer, `radius-pill` for chips and glass buttons.
- **iOS Liquid Glass.** Top-bar buttons, the tab bar, chips, the composer, sheets and menus are glass: `glass` or `sheet` fill, backdrop blur (22px buttons, 30px sheets) with saturate 180–190%, and `shadow-glass`. The iOS tab bar floats as a capsule and shrinks to one circle when scrolling. Android draws the same parts flat on `bg`/`bg2` with Material spacing; layouts and copy are identical.
- **Shadows.** Only `shadow-glass` on glass and `shadow-pop` on menus. Cards have no shadow and usually no box.
- **Imagery.** Job cards lead with a large company photo (placeholder: brand gradient + initial). Avatars are circles with the person's given name.
- **Motion.** Sheets rise with a soft spring (cubic-bezier(.2,.9,.25,1), ~0.4s). Agent work animates: StatusRow glyph and shimmer, blinking running dots, strike-through on finished to-dos. Respect reduced motion.
- **Focus.** A 2px solid `ac` ring with 2px offset on every interactive element.

## Layout patterns

- **Tabs:** 홈 · 허브 · 소셜 · AI 채팅 · 마이. Detail screens push inside the current tab.
- **Choices open bottom sheets,** never new screens: filters, pickers, quick starts, apply. A sheet that holds a whole flow (계정 → 요금제) opens near full height and navigates inside itself.
- **AI chat:** the first screen is empty except a faint Push. mark, QuickStartPills and the Composer. Once a conversation starts the tab bar hides; the top bar has the drawer button, title, new chat and ⋯. The drawer slides in full width with the account, 새 대화 · 내 서류 · 북마크한 공고 and recent chats.
- **Agent transcript:** user bubbles right on `fill`; agent text left with a violet dot; ToolLines with ⎿ results; to-do lists; diffs (green add, red strike); fit cards; ApprovalPanel to decide.

## Iconography

- Line icons: 24×24 grid, 2px stroke, round caps and joins (`assets/Icons`). Colour follows the text they sit with. Filled variants mark selection (tab bar) or a saved state (bookmark).
- 3D icons (`assets/3D Icons`): full-colour objects for the home shortcut cards (52px, tilted −8°, over a matching colour glow) and quick-start pills (30px). Nowhere else. Final art should replace these placeholder SVGs with rendered PNGs.
- No emoji as icons.

## Logo

There is no logo file yet. Set the wordmark as "Push" in Pretendard 800 with a violet `ac` full stop: **Push.**
