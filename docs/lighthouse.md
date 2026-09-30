# Lighthouse 성능·접근성 감사

웹 빌드(`vite preview`)를 Lighthouse로 감사하고 카테고리별 점수 하한을 검증하는 스크립트.

## 실행

```sh
npm run audit:lighthouse
```

동작 순서:

1. `dist/index.html`이 없으면 `npm run build`를 먼저 실행한다.
2. `vite preview`를 띄우고(`--strictPort`), 루트 URL(`/`, 비로그인 상태라 로그인 페이지)을 데스크톱 프리셋으로 감사한다.
3. `lighthouse/report.html`과 `lighthouse/report.json`을 쓰고(gitignore 대상), 카테고리 점수가 예산을 못 넘기면 비정상 종료한다.

## 요구 사항

- Chrome/Chromium이 필요하다. `chrome-launcher`가 자동 탐지하며, 순서는:
  1. `CHROME_PATH` 환경 변수(직접 지정)
  2. 시스템 Chrome(자동 탐지)
  3. Playwright 캐시의 Chromium(`~/Library/Caches/ms-playwright/chromium-*`)— `npm exec playwright install chromium` 한 번이면 된다.
- 헤드리스로 돌기 때문에 로그인 없이 가능하다. 별도 백엔드는 없어도 되지만 API 호출이 실패하므로 `errors-in-console` 감사가 감점되는 것은 정상이다.

## 예산

`scripts/lighthouse.mjs`의 `BUDGETS`에 정의되어 있고 환경 변수로 덮어쓸 수 있다.

| 카테고리       | 예산 | 환경 변수                  |
| -------------- | ---- | -------------------------- |
| performance    | 80   | `LH_BUDGET_PERFORMANCE`    |
| accessibility  | 95   | `LH_BUDGET_ACCESSIBILITY`  |
| best-practices | 90   | `LH_BUDGET_BEST_PRACTICES` |
| seo            | 75   | `LH_BUDGET_SEO`            |

포트는 `LH_PORT`(기본 4173).

## 기준값 (2026-10-01 측정, 데스크톱 프리셋)

| 카테고리       | 점수 |
| -------------- | ---- |
| performance    | 94   |
| accessibility  | 100  |
| best-practices | 96   |
| seo            | 82   |

## 알려진 노이즈

- `meta-description`, `robots.txt`, `llms.txt` 등은 데스크톱 앱 웹뷰라 의미가 약하다 — SEO 카테고리 점수에 반영된다.
- `errors-in-console`: 미리보기 서버에 백엔드가 없어 API 요청이 실패하기 때문.
- 성능 점수는 머신 상태에 따라 ±5 정도 출렁인다. 예산을 올릴 때는 여유를 두는 게 좋다.
