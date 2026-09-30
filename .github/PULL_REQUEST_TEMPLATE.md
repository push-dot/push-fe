## 요약

<!-- 무엇을 왜 바꾸는지 2~3줄 -->

## 체크리스트

- [ ] 테스트 추가/업데이트 — vitest(`npm test`) 또는 Playwright(`npm run test:e2e`). 인시던트 수정이면 회귀 테스트 필수(`docs/incidents/README.md`)
- [ ] 회귀 위험 — 영향 범위를 확인했고, 위험한 변경이면 실험 variant(`EXPERIMENT_KEYS`) 뒤에 두거나 롤백 경로가 있다
- [ ] 롤백 노트 — 문제 시 되돌리는 방법을 아래에 적었다(revert, variant 롤백 등)
- [ ] 모니터링 — Sentry로 잡히는 새 오류 경로를 도입/제거한다면 기재했다. 알림 영향이 있으면 명시

## 롤백 노트

<!-- revert로 충분한지, 실험 배정 변경으로 끌 수 있는지, 데이터 마이그레이션 등 되돌리기 어려운 변경이 있는지 -->

## 검증

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] (해당 시) `npm run test:e2e` — CI e2e job은 `continue-on-error`이므로 로컬 확인 권장
