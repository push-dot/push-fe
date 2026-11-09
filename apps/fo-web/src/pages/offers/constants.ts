export const OFFERS_PATH = '/offers'
export const OFFER_EMPTY_ACTION_TO = '/me'

export const OFFER_TITLE = '제안함'
export const OFFER_TAB_RECEIVED = '받은 제안'
export const OFFER_TAB_SENT = '보낸 제안'
export const OFFER_EMPTY_RECEIVED = '아직 받은 제안이 없어요.'
export const OFFER_EMPTY_SENT = '아직 보낸 제안이 없어요.'
export const OFFER_EMPTY_ARCHIVED = '보관한 제안이 없어요.'
export const OFFER_EMPTY_ACTION = '허브 프로필 다듬기'
export const OFFER_PICK = '제안을 골라 주세요'
export const OFFER_PICK_HINT = '왼쪽 목록에서 고르면 대화가 열려요.'
export const OFFER_PUBLIC_NOTE = '허브 프로필이 공개돼 있어야 제안을 받을 수 있어요.'
export const OFFER_PROFILE = '허브 프로필 보기'
export const OFFER_POSTING = '함께 보낸 공고'
export const OFFER_LOAD_ERROR = '제안을 불러오지 못했어요.'
export const OFFER_LIST_BACK = '제안함 목록'
export const OFFER_MENU = '제안 메뉴'

export const OFFER_ARCHIVED_TITLE = '보관한 제안'
export const OFFER_ARCHIVED_NOTE = '보관한 제안은 받은 제안 목록과 알림에서 빠져요. 열어서 보관을 풀 수 있어요.'
export const OFFER_ARCHIVED_BADGE = '보관함'
export const offerArchiveRow = (count: number) => `${OFFER_ARCHIVED_TITLE} · ${count}개`

export const OFFER_ACCEPTED = '제안을 수락했어요'
export const OFFER_DECLINED = '제안을 거절했어요'
export const OFFER_ACCEPT = '수락하고 답장하기'
export const OFFER_DECLINE = '거절'
export const OFFER_ACCEPT_HINT = '수락하면 답장을 보낼 수 있어요.'
export const OFFER_DECLINED_FOOT = '거절한 제안에는 답장할 수 없어요.'
export const OFFER_CLOSED_FOOT = '이 대화에는 더 이상 메시지를 보낼 수 없어요.'
export const OFFER_SEND = '보내기'
export const OFFER_MESSAGE = '메시지'
export const OFFER_MESSAGE_PLACEHOLDER = '메시지를 입력해 주세요'
export const OFFER_MESSAGE_FAILED = '메시지를 보낼 수 없어요'

export const OFFER_MENU_COPY = {
  profile: '허브 프로필 보기',
  archive: '제안 보관하기',
  unarchive: '보관 풀기',
  report: '신고하기',
  block: '차단하기',
  archived: '제안을 보관했어요',
  undo: '되돌리기',
  reported: '신고가 접수됐어요',
  failed: '잠시 뒤에 다시 시도해 주세요.',
}
export const offerBlocked = (name: string) => `${name} 님을 차단했어요`
export const offerBlockConfirm = (name: string) => ({
  title: `${name} 님을 차단할까요?`,
  body: `${name} 님의 제안이 목록에서 사라지고, 앞으로 제안과 메시지를 받지 않아요. 상대에게는 차단했다고 알리지 않아요.`,
  note: '설정 › 차단한 사람에서 언제든 풀 수 있어요.',
  confirm: '차단',
})
