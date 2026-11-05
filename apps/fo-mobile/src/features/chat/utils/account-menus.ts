import type { AccessMode, Tone } from '@push/api-client'
import type { Account } from '../api/schemas'
import { TONES } from '@/features/my'
import type { MenuAction } from '@/shared/components'
import { ACCESS_MODES } from '../constants'

/** 계정 › 말투: inline menu, the saved tone checked (그대로 when none is saved). */
export const toneMenu = (current: Tone | undefined, onPick: (tone: Tone) => void): MenuAction[] =>
  TONES.map((t) => ({ key: t.key, label: t.label, selected: t.key === (current ?? 'as_is'), onPress: () => onPick(t.key) }))

/** 계정 › 실행 방식: inline menu, the current mode checked. */
export const accessMenu = (current: AccessMode, onPick: (mode: AccessMode) => void): MenuAction[] =>
  ACCESS_MODES.map((m) => ({ key: m.key, label: m.label, selected: m.key === current, onPress: () => onPick(m.key) }))

export const usagePercent = (credits: Account['credits'] | undefined) =>
  credits && credits.total > 0 ? Math.min(100, Math.max(0, Math.round((credits.used / credits.total) * 100))) : null

/** 계정 › 대화 row: the artboard shows 그대로 for the default tone, other tones read as "친근한 말투". */
export const toneLabel = (tone?: { key: Tone; label: string }) => (tone && tone.key !== 'as_is' ? `${tone.label} 말투` : '그대로')

/** 계정 › 에이전트가 참고하는 내 정보: the role of the job the user holds now, else the headline. */
export const currentRole = (profile?: { headline: string; careers: { role: string; endedOn?: string | null }[] }) =>
  profile?.careers.find((c) => !c.endedOn)?.role ?? profile?.headline
