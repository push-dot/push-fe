import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useMyProfile, useSources } from '../../entities/profile'
import { applySourceIds, postingsApply } from '../../features/apply-to-posting'
import { brandColor } from '@push/shared'
import { initials, roleLabel } from '../../shared/lib/format'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import type { ListedSource } from '../../shared/api/sources'
import {
  APPLY_CANCEL,
  APPLY_CLOSE,
  APPLY_ERROR_BODY,
  APPLY_ERROR_TITLE,
  APPLY_HINT,
  APPLY_LOCK,
  APPLY_RETRY,
  APPLY_SENDING,
  DOCS_PATH,
  GROUP_PROFILE,
  GROUP_PUSH,
  GROUP_UPLOAD,
  NO_DOCS_BODY,
  NO_DOCS_CTA,
  NO_DOCS_TITLE,
  ORIGINAL_BADGE,
  PROFILE_ID,
  PROFILE_TITLE,
  PUSH_BADGE,
  applyConfirmLabel,
  applyPair,
  effectivePicks,
  fileBadge,
  profileSub,
  pushDocSub,
  togglePick,
  uploadSub,
} from './apply-copy'
import { APPLY_TITLE, SOURCE_AI } from './constants'

type ItemProps = { on: boolean; onToggle: () => void; lead: React.ReactNode; title: string; sub: string; badge: React.ReactNode }

const Item = ({ on, onToggle, lead, title, sub, badge }: ItemProps) => (
  <button type="button" role="checkbox" aria-checked={on} className={on ? 'apply-item on' : 'apply-item'} onClick={onToggle}>
    <span className={on ? 'ck on' : 'ck'}>{on ? <Icon name="check" size={14} width={3} /> : null}</span>
    {lead}
    <span className="apply-copy">
      <span className="b2 w7 cap">{title}</span>
      <span className="c1 t3">{sub}</span>
    </span>
    {badge}
  </button>
)

const ApplySheet = ({
  postingId,
  company,
  title,
  onClose,
  onApplied,
}: {
  postingId: string
  company?: string | null
  title?: string | null
  onClose: () => void
  onApplied: () => void
}) => {
  const queryClient = useQueryClient()
  const sources = useSources()
  const profile = useMyProfile()
  const [pickedIds, setPickedIds] = useState<string[] | null>(null)
  const list: ListedSource[] = sources.data ?? []
  const picked = effectivePicks(pickedIds, list, Boolean(profile.data))
  const apply = useMutation({
    mutationFn: () => {
      const { documentIds, sourceIds } = applySourceIds(list, picked)
      return postingsApply(postingId, documentIds, sourceIds)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posting', postingId] })
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
      onApplied()
    },
  })
  const toggle = (id: string) => {
    setPickedIds(togglePick(picked, id))
    apply.reset()
  }
  if (sources.isSuccess && list.length === 0) {
    return (
      <Dialog label={NO_DOCS_TITLE} onClose={onClose} className="apply-empty">
        <span className="apply-empty-tile">
          <Icon name="doc" size={28} width={1.8} />
        </span>
        <h2 className="h3">{NO_DOCS_TITLE}</h2>
        <p className="b2 t3">{NO_DOCS_BODY}</p>
        <div className="sheet-actions apply-actions">
          <button type="button" className="btn sec" onClick={onClose}>
            {APPLY_CANCEL}
          </button>
          <Link to={DOCS_PATH} className="btn pri">
            {NO_DOCS_CTA}
          </Link>
        </div>
      </Dialog>
    )
  }
  const pushDocs = list.filter((source) => source.origin === 'AI')
  const uploads = list.filter((source) => source.origin !== 'AI')
  const me = profile.data
  const name = me?.displayName ?? ''
  const rowOn = (id: string) => picked.includes(id)
  return (
    <Dialog label="지원 서류" onClose={apply.isPending ? () => undefined : onClose} wide className="apply-sheet">
      <div className="apply-head">
        <span className="apply-title">
          <h2 className="h2">{APPLY_TITLE}</h2>
          {applyPair(company, title) ? <p className="b2 t3">{applyPair(company, title)}</p> : null}
        </span>
        <button type="button" className="hbtn apply-close" aria-label={APPLY_CLOSE} disabled={apply.isPending} onClick={onClose}>
          <Icon name="close" size={18} width={2.4} />
        </button>
      </div>
      <div className={apply.isPending ? 'apply-groups busy' : 'apply-groups'} aria-busy={apply.isPending}>
        <div className="c1 w7 t3">{GROUP_PROFILE}</div>
        {me ? (
          <Item
            on={rowOn(PROFILE_ID)}
            onToggle={() => toggle(PROFILE_ID)}
            lead={
              <span className="av apply-av" style={{ background: brandColor(name || 'Push') }}>
                {initials(name)}
              </span>
            }
            title={PROFILE_TITLE}
            sub={profileSub(roleLabel(me.jobCategory, me.tenureYears), me.careers.length, me.skills.length)}
            badge={<span className="badge ac">{GROUP_PROFILE}</span>}
          />
        ) : null}
        {sources.isPending ? <span className="skeleton-block" /> : null}
        {pushDocs.length ? <div className="c1 w7 t3 apply-label">{GROUP_PUSH}</div> : null}
        {pushDocs.map((source) => (
          <Item
            key={source.id}
            on={rowOn(source.id)}
            onToggle={() => toggle(source.id)}
            lead={<span className="badge ac">{PUSH_BADGE}</span>}
            title={source.fileName}
            sub={pushDocSub(source)}
            badge={<span className="badge ac">{SOURCE_AI}</span>}
          />
        ))}
        {uploads.length ? <div className="c1 w7 t3 apply-label">{GROUP_UPLOAD}</div> : null}
        {uploads.map((source) => (
          <Item
            key={source.id}
            on={rowOn(source.id)}
            onToggle={() => toggle(source.id)}
            lead={<span className="badge red">{fileBadge(source.fileName)}</span>}
            title={source.fileName}
            sub={uploadSub(source)}
            badge={<span className="badge grey">{source.kind || ORIGINAL_BADGE}</span>}
          />
        ))}
      </div>
      <p className="apply-hint c1 t3">
        {APPLY_HINT}
        <br />
        {APPLY_LOCK}
      </p>
      {apply.isError ? (
        <div className="apply-error c1" role="alert">
          <Icon name="warn" size={18} className="red" />
          <span>
            <span className="b2 w7 red">{APPLY_ERROR_TITLE}</span>
            <span className="t2">{APPLY_ERROR_BODY}</span>
          </span>
        </div>
      ) : null}
      <div className="sheet-actions apply-actions">
        <button type="button" className="btn sec" disabled={apply.isPending} onClick={onClose}>
          {APPLY_CANCEL}
        </button>
        <button type="button" className="btn pri" aria-busy={apply.isPending} disabled={picked.length === 0 || apply.isPending} onClick={() => apply.mutate()}>
          {apply.isPending ? (
            <>
              <svg className="apply-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" opacity=".3" />
                <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
              </svg>
              {APPLY_SENDING}
            </>
          ) : apply.isError ? (
            APPLY_RETRY
          ) : (
            applyConfirmLabel(picked.length)
          )}
        </button>
      </div>
    </Dialog>
  )
}

export default ApplySheet
