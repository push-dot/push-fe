import type { BadgeTone } from '@/shared/components'
import type { ChoiceSection, ChoiceSubmit, StreamEvent, StreamOption } from '@push/api-client'
import type { Approval, ApprovalSection, ChatEvent, ChatItem, Choice } from '../types'

/** Badge colour for a plan or feedback tag. Unknown tags stay grey. */
export const PLAN_TAG_TONE: Record<string, BadgeTone> = {
  강화: 'ac',
  수정: 'grey',
  추가: 'green',
  축소: 'orange',
  키워드: 'orange',
  도메인: 'orange',
}

export const planTone = (tag: string): BadgeTone => PLAN_TAG_TONE[tag] ?? 'grey'

const choiceOf = (o: StreamOption): Choice => ({
  label: o.label,
  ...(o.desc ? { desc: o.desc } : {}),
  ...(o.sub ? { hint: o.sub } : {}),
  ...(o.badge ? { badge: { label: o.badge, tone: 'ac' as const } } : {}),
})

const picked = (ids: string[] | undefined, selected: string[] | undefined) =>
  (ids ?? []).flatMap((id, i) => (selected?.includes(id) ? [i] : []))

const sectionOf = (raw: ChoiceSection | { kind: string }, recommended?: string): ApprovalSection | null => {
  if (raw.kind !== 'chips' && raw.kind !== 'rows' && raw.kind !== 'toggle' && raw.kind !== 'thumbnails') return null
  const s = raw as ChoiceSection
  switch (s.kind) {
    case 'chips':
      return {
        id: s.id,
        kind: 'chips',
        title: s.title,
        options: s.options.map((o) => o.label),
        ids: s.options.map((o) => o.id),
        selected: picked(s.options.map((o) => o.id), s.selected),
        ...(s.multiple ? { multi: true } : {}),
      }
    case 'rows':
      return {
        id: s.id,
        kind: 'rows',
        title: s.title ?? '가져올 자료',
        items: s.options.map((o) => ({
          id: o.id,
          tag: o.badge ?? '',
          title: o.label,
          sub: o.sub ?? '',
          ...(o.action ? { action: o.action } : {}),
        })),
      }
    case 'toggle':
      return {
        id: s.id,
        kind: 'toggle',
        items: s.options.map(choiceOf),
        ids: s.options.map((o) => o.id),
        selected: picked(s.options.map((o) => o.id), s.selected),
      }
    case 'thumbnails':
      return {
        id: s.id,
        kind: 'templates',
        items: s.options.map((o) => ({
          id: o.id,
          label: o.label,
          ...(o.badge === '추천' || o.id === recommended ? { recommended: true } : {}),
        })),
        selected: picked(s.options.map((o) => o.id), s.selected),
      }
    default:
      return null
  }
}

const answerableIds = (sections: ApprovalSection[]) =>
  sections.flatMap((s) => {
    if (s.kind === 'rows') return []
    if (s.kind === 'chips' || s.kind === 'toggle') return s.ids ?? []
    if (s.kind === 'templates') return s.items.map((t) => t.id).filter((id): id is string => !!id)
    return s.ids ?? []
  })

export const approvalFromSections = (ev: Extract<StreamEvent, { type: 'choice' }>): Approval => {
  const sections = (ev.sections ?? []).flatMap((s) => {
    const mapped = sectionOf(s, ev.recommended)
    return mapped ? [mapped] : []
  })
  const submit: ChoiceSubmit | undefined = ev.submit
  const pending = ev.note && (!ev.resolution || ev.resolution.status === 'PENDING') ? ev.note : undefined
  return {
    id: ev.id,
    question: ev.title ?? '',
    detail: ev.detail,
    sections,
    optionIds: ['submit', ...answerableIds(sections)],
    ...(submit ? { submit: submit.label } : {}),
    ...(submit?.optionLabels ? { submitLabels: submit.optionLabels } : {}),
    ...(submit?.zeroLabel ? { zeroSubmit: submit.zeroLabel } : {}),
    ...(pending ? { pendingNote: pending } : {}),
  }
}

export const mapThink = (ev: Extract<StreamEvent, { type: 'think' }>): ChatItem => ({
  type: 'think',
  id: `think-${ev.seq ?? ev.phase ?? '0'}`,
  seconds: ev.seconds,
})

export const mapPlan = (ev: Extract<StreamEvent, { type: 'plan' }>): ChatItem => ({
  type: 'plan',
  id: ev.id ?? `plan-${ev.seq ?? 0}`,
  title: ev.title,
  meta: ev.meta,
  rows: ev.rows.map((r) => ({ tag: r.tag, tone: planTone(r.tag), label: r.label, note: r.note })),
  keywords: ev.keywords ?? [],
})

export const mapPaper = (ev: Extract<StreamEvent, { type: 'paper' }>): ChatItem => ({
  type: 'paper',
  id: ev.id,
  label: ev.label,
  heading: ev.heading,
  lines: ev.lines,
})

/** Submit label follows the selected thumbnail, else replaces {n}. */
export const submitLabelFor = (approval: Approval, selected: { templateId?: string; toggleCount: number }): string => {
  const fromThumb = selected.templateId ? approval.submitLabels?.[selected.templateId] : undefined
  if (fromThumb) return fromThumb
  const base = approval.submit ?? ''
  if (!base.includes('{n}')) return base
  if (selected.toggleCount === 0 && approval.zeroSubmit) return approval.zeroSubmit
  return base.replaceAll('{n}', String(selected.toggleCount))
}

/** Section cards answer with submit plus the picked ids. Cancel stays a single id. */
export const sectionAnswer = (cancel: boolean, pickedIds: string[]): { optionId: string; optionIds?: string[] } =>
  cancel ? { optionId: 'cancel' } : { optionId: 'submit', optionIds: ['submit', ...pickedIds] }

export const attachPendingNote = (items: ChatItem[], note: string | undefined): ChatItem[] => {
  if (!note) return items
  const i = items.findLastIndex((it) => it.type === 'result' && it.source === 'profile')
  if (i < 0) return items
  const next = items.slice()
  const card = next[i]
  if (card?.type !== 'result' || card.source !== 'profile') return items
  next[i] = { ...card, pendingNote: note }
  return next
}

export const clearPendingNote = (items: ChatItem[]): ChatItem[] =>
  items.map((it) => (it.type === 'result' && it.source === 'profile' && it.pendingNote ? { ...it, pendingNote: undefined } : it))

export const isSectionChoice = (ev: ChatEvent): ev is Extract<ChatEvent, { type: 'approval' }> =>
  ev.type === 'approval' && ev.approval.sections.some((s) => s.kind !== 'choices')
