export const NOTIFICATION_NOTE = '에이전트 작업 완료 알림은 앱에서 받아요'
export const NOTIFICATION_EMPTY = '아직 받은 알림이 없어요.'
export const NOTIFICATION_ERROR = '알림을 불러오지 못했어요.'
export const NOTIFICATION_READ_ALL = '모두 읽음'
export const NOTIFICATION_TITLE = '알림'
export const NOTIFICATION_KIND = {
  APPLICATION_STAGE: { color: 'var(--notifStage)', path: 'M3 8h18v12H3ZM9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M3 13h18' },
  OFFER: { color: 'var(--notifOffer)', path: 'M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4 17-6.5Z' },
  COMMENT: { color: 'var(--notifComment)', path: 'M12 3.5c5 0 9 3.4 9 7.6s-4 7.6-9 7.6c-1 0-2-.1-2.9-.4L4.5 20.5l1.2-3.9C4.3 15.2 3 13.3 3 11.1 3 6.9 7 3.5 12 3.5Z' },
  DEADLINE: { color: 'var(--notifDeadline)', path: 'M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0ZM12 7.5V12l3 2' },
  AI_DONE: { color: 'var(--notifAi)', path: 'M11 3c.6 4 2.7 6.1 6.7 6.7-4 .6-6.1 2.7-6.7 6.7-.6-4-2.7-6.1-6.7-6.7C8.3 9.1 10.4 7 11 3ZM18.5 14.5c.3 2 1.2 2.9 3 3.2-1.8.3-2.7 1.2-3 3.2-.3-2-1.2-2.9-3-3.2 1.8-.3 2.7-1.2 3-3.2Z' },
} as const
