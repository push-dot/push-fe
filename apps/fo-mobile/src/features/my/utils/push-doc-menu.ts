import type { MenuAction, MenuSection } from '@/shared/components/menu-action'

export type PushDocAction = 'posting' | 'export' | 'rename' | 'duplicate' | 'delete'

// shortcut: duplicate has no push-be endpoint (be-requests-r5.md), flip it to true when POST documents/:id/duplicate ships.
export const PUSH_DOC_SUPPORT: Record<PushDocAction, boolean> = {
  posting: true,
  export: true,
  rename: true,
  duplicate: false,
  delete: true,
}

const ITEMS: Record<PushDocAction, Omit<MenuAction, 'key' | 'onPress'>> = {
  posting: { label: '공고 보기', systemImage: 'safari', icon: 'ext' },
  export: { label: 'PDF로 내보내기', systemImage: 'arrow.down.doc', icon: 'download-pdf' },
  rename: { label: '이름 바꾸기', systemImage: 'pencil', icon: 'edit' },
  duplicate: { label: '복제하기', systemImage: 'plus.square.on.square', icon: 'copy' },
  delete: { label: '삭제하기', systemImage: 'trash', icon: 'delete', destructive: true },
}

const GROUPS: { key: string; actions: PushDocAction[] }[] = [
  { key: 'doc', actions: ['posting', 'export', 'rename', 'duplicate'] },
  { key: 'danger', actions: ['delete'] },
]

/** The ⋯ menu of a Push document: a missing capability is hidden, 공고 보기 needs a posting, and a group left empty drops with its divider. */
export const pushDocMenu = (
  doc: { hasPosting: boolean },
  on: Record<PushDocAction, () => void>,
  support: Record<PushDocAction, boolean> = PUSH_DOC_SUPPORT,
): MenuSection[] =>
  GROUPS.map(({ key, actions }) => ({
    key,
    actions: actions
      .filter((a) => support[a] && (a !== 'posting' || doc.hasPosting))
      .map((a) => ({ key: a, ...ITEMS[a], onPress: on[a] })),
  })).filter((s) => s.actions.length)
