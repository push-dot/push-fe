# Button

The one action button: a full-width primary or a secondary next to it.

- **Primary** (`ac` fill, white `button` text, 56px, `radius-md`): the single main action on a screen or sheet. One per screen.
- **Secondary** (`fill`, `t1` text): the companion action, sized to its label when it sits left of a primary ("AI로 맞추기 · 지원하기").
- **Small** (40px, `radius-sm`, 14px): inline actions in rows and headers ("저장", "기본 정보 편집").
- **Disabled**: 45% opacity, label states the finished fact ("지원 완료"), never "비활성".
- On iOS the secondary button is glass (`glass` + `shadow-glass` + blur). Android keeps `fill`.
- The consumer provides the label (verb first, 2–6 characters where possible) and an optional 16px icon before it.
