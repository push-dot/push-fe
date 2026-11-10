# @push/design-system

Claude Design "Push 디자인 시스템"의 토큰과 아이콘을 fo-mobile과 fo-web에 같이 주는 패키지예요. 화면 컴포넌트는 넣지 않아요. RN 컴포넌트는 fo-mobile에, 웹 컴포넌트는 fo-web에 두세요.

## 쓰는 법

```ts
import { colors, typography, spacing, radius, shadows, LINE_ICONS } from '@push/design-system'
```

```ts
import '@push/design-system/tokens.css'
```

- `colors.light`, `colors.dark`: 색. 이름은 시안 CSS와 같아요(`acSoft`, `acText`).
- `typography`: px 크기, px 줄 높이, 굵기, em 자간이에요. 자간을 따로 정하지 않은 스타일은 기본값 -0.02em이에요.
- `spacing`(`1`–`6`), `radius`(`xs`–`pill`, 부품별 `card`·`buttonIos`·`buttonAndroid`·`chip`·`sheetTop` 등): px 숫자예요.
- `largeText`: 큰 글씨 모드의 크기와 줄 높이예요. `fontWeights`: `w6`, `w7`. `platform.ios`, `platform.android`: 안전 영역과 탭바 높이(px)예요.
- `shadows.light.pop`, `shadows.light.glass`: CSS `box-shadow` 문자열이에요. RN에서는 fo-mobile `src/theme`이 바꿔 써요.
- `LINE_ICONS`, `ICONS_3D`, `BRAND`: 이름별 SVG 문자열이에요. 선 아이콘은 `currentColor`로 그려요. 원본 SVG는 `assets/`에 있어요.

`tokens.css`는 `:root`에 라이트 값을 넣고, `[data-theme=dark]`이나 시스템 다크 모드(`prefers-color-scheme`)에서 다크 값으로 바꿔요. `data-theme="light"`를 단 요소 안은 시스템이 다크여도 라이트예요. 그림자는 시안 이름대로 `--shadow`, `--glassShadow`이고, 간격은 `--sp1`–`--sp6`, 반경은 `--r-xs`–`--r-pill`이에요. `.h1`–`.c2`, `.button`, `.tab`, `.mono` 타입 클래스도 같이 들어 있어요.

## 원본과 생성 파일

| 파일 | 내용 |
| --- | --- |
| `tokens/design-system.json` | 디자인 시스템에서 내보낸 `tokens.json` 그대로예요 (2026-10-20 수정본). |
| `tokens/push-app.json` | 앱 핸드오프("Push 앱", 2026-11-05) `design-system/tokens.json` 그대로예요. 색·그림자·반경·큰 글씨·플랫폼 값은 이 파일이 이겨요. 글꼴만 예외예요: 시안 CSS 마지막 규칙이 Noto Sans KR이라 `design-system.json` 값을 써요. |
| `assets/icons`, `assets/icons-3d`, `assets/brand` | 선 아이콘 61개, 색 아이콘 32개(3D·빠른 시작·Google), 마스코트 2개예요. 2026-11-05 핸드오프 `icons/`·`brand/`에서 가져왔어요. 이미 있던 그림은 코드 이름을 그대로 두었어요(예: 핸드오프 `chevron-right` = `chev`). 핸드오프 `chart`는 `chart`와 겹쳐서 `bars`예요. |
| `src/tokens.ts`, `src/tokens.css`, `src/icons.ts` | 위 파일로 만든 결과예요. 직접 고치지 마세요. |

원본을 바꿨으면 생성 파일을 다시 만드세요.

```sh
pnpm --filter @push/design-system generate
```

`pnpm --filter @push/design-system test`는 생성 파일이 원본과 다르면 실패해요.

## 앱 캔버스가 이긴 값

| 토큰 | 디자인 시스템 | 앱 캔버스 |
| --- | --- | --- |
| `t3` 라이트 | `#848C96` | `#646B75` |
| `t4` 라이트 | `#B4BAC2` | `#646B75` |
| `t4` 다크 | `#5C636C` | `#8C939C` |
| `ac` 다크 | `#7464FF` | `#6B5BFA` |
| `red` 라이트 | `#E5484D` | `#C9302C` |
| `green` 라이트 | `#0E9F55` | `#087A3E` |
| `orange` 라이트 | `#EB6A00` | `#AD4E00` |

디자인 시스템에 없고 캔버스에만 있는 색은 `acPress`(누른 기본 버튼), `paper`(서류 뷰어 종이), `deco`(장식 전용: 시트 손잡이, 할 일 상자, 결과 꺾쇠, 대기 메시지 테두리)예요. `deco`는 글자에 쓰지 마세요. `orangeFill`(주황 경고 원, 웹 캔버스 audit 층이 두 테마 모두 `#AD4E00`)과 `onFill`(채운 색 위 흰 글자)은 웹 캔버스 값이에요.
