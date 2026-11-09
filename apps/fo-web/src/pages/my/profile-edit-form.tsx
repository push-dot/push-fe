import {
  CAREER_STATUSES,
  JOB_CATEGORIES,
  type Career,
  type CareerStatus,
  type JobCategory,
  type Profile,
} from '@push/api-client'
import { useRef, useState } from 'react'
import { uploadAvatar } from '../../features/update-profile'
import { assetUrl } from '../../shared/api/client'
import { Icon } from '../../shared/ui/icon'
import {
  CANCEL_LABEL,
  CAREER_ADD,
  PROFILE_EDIT,
  PROFILE_EDIT_SUB,
  PROFILE_FIELDS,
  PROFILE_LIMITS,
  PROFILE_PHOTO,
  SAVE_LABEL,
  TENURE_LABEL,
  TENURE_MAX,
} from './constants'
import CareerDialog from './career-dialog'
import { careerSpan, countLabel, statusTone } from './my-rules'
import ProfileAvatar from './profile-avatar'
import ProfileSelect from './profile-select'
import SkillEditor from './skill-editor'

export type ProfileDraft = Pick<
  Profile,
  | 'displayName'
  | 'headline'
  | 'careerStatus'
  | 'jobCategory'
  | 'tenureYears'
  | 'intro'
  | 'careers'
  | 'skills'
> & { avatarKey?: string }

type ProfileEditFormProps = {
  profile: Profile
  busy: boolean
  onSave: (draft: ProfileDraft) => void
  onCancel: () => void
  onPhotoFail: () => void
}

const PHOTO_ACCEPT = 'image/jpeg,image/png'
const TENURES = Array.from({ length: TENURE_MAX + 1 }, (_, years) => ({
  value: String(years),
  label: TENURE_LABEL(years),
}))

const ProfileEditForm = ({
  profile,
  busy,
  onSave,
  onCancel,
  onPhotoFail,
}: ProfileEditFormProps) => {
  const photoRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<ProfileDraft>(() => ({
    displayName: profile.displayName,
    headline: profile.headline,
    careerStatus: profile.careerStatus,
    jobCategory: profile.jobCategory,
    tenureYears: profile.tenureYears,
    intro: profile.intro,
    careers: profile.careers,
    skills: profile.skills,
  }))
  const [photo, setPhoto] = useState(assetUrl(profile.avatarUrl))
  const [career, setCareer] = useState<{ index: number | null } | null>(null)
  const patch = (next: Partial<ProfileDraft>) => setDraft((current) => ({ ...current, ...next }))
  const status = CAREER_STATUSES.find((item) => item.key === draft.careerStatus)
  const editing = career?.index == null ? null : (draft.careers[career.index] ?? null)
  const saveCareer = (next: Career) => {
    const index = career?.index
    patch({
      careers:
        index == null
          ? [...draft.careers, next]
          : draft.careers.map((item, at) => (at === index ? next : item)),
    })
    setCareer(null)
  }
  return (
    <div className="mp">
      <p className="c1 t3 mp-sub">{PROFILE_EDIT_SUB}</p>
      <form
        className="mp-edit"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(draft)
        }}
      >
        <div className="mp-photo">
          <ProfileAvatar name={draft.displayName || profile.displayName} src={photo} />
          <span className="mp-photo-copy">
            <button type="button" className="btn sec sm" onClick={() => photoRef.current?.click()}>
              {PROFILE_PHOTO.change}
            </button>
            <span className="c1 t3">{PROFILE_PHOTO.hint}</span>
          </span>
          <input
            ref={photoRef}
            className="file-input"
            type="file"
            accept={PHOTO_ACCEPT}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              uploadAvatar(file)
                .then((image) => {
                  patch({ avatarKey: image.key })
                  setPhoto(assetUrl(image.url))
                })
                .catch(onPhotoFail)
            }}
          />
        </div>
        <div className="mp-grid">
          <label className="field">
            {PROFILE_FIELDS.name}
            <input
              value={draft.displayName}
              maxLength={PROFILE_LIMITS.name}
              onChange={(event) => patch({ displayName: event.target.value })}
            />
          </label>
          <ProfileSelect
            label={PROFILE_FIELDS.status}
            value={draft.careerStatus ?? ''}
            options={CAREER_STATUSES.map((item) => ({ value: item.key, label: item.label }))}
            display={
              status ? (
                <span className={`badge ${statusTone(status.key)}`}>{status.label}</span>
              ) : null
            }
            onChange={(value) => patch({ careerStatus: (value || null) as CareerStatus | null })}
          />
        </div>
        <div>
          <label className="field">
            {PROFILE_FIELDS.headline}
            <input
              value={draft.headline}
              maxLength={PROFILE_LIMITS.headline}
              onChange={(event) => patch({ headline: event.target.value })}
            />
          </label>
          <span className="c1 t4 num mp-count">
            {countLabel(draft.headline, PROFILE_LIMITS.headline)}
          </span>
        </div>
        <div className="mp-grid">
          <ProfileSelect
            label={PROFILE_FIELDS.job}
            value={draft.jobCategory ?? ''}
            options={JOB_CATEGORIES.map((item) => ({ value: item.key, label: item.label }))}
            onChange={(value) => patch({ jobCategory: (value || null) as JobCategory | null })}
          />
          <ProfileSelect
            label={PROFILE_FIELDS.tenure}
            value={draft.tenureYears == null ? '' : String(Math.min(draft.tenureYears, TENURE_MAX))}
            options={TENURES}
            onChange={(value) => patch({ tenureYears: value === '' ? null : Number(value) })}
          />
        </div>
        <div>
          <label className="field">
            {PROFILE_FIELDS.intro}
            <textarea
              value={draft.intro}
              maxLength={PROFILE_LIMITS.intro}
              onChange={(event) => patch({ intro: event.target.value })}
            />
          </label>
          <span className="c1 t4 num mp-count">
            {countLabel(draft.intro, PROFILE_LIMITS.intro)}
          </span>
        </div>
        <div>
          <span className="mp-lbl">{PROFILE_FIELDS.careers}</span>
          <div className="mp-careers">
            {draft.careers.map((item, index) => (
              <div className="mp-career" key={`${item.company}-${item.startedOn}-${index}`}>
                <span className="mp-career-copy">
                  <span className="b1 w7 cap">{`${item.company} · ${item.role}`}</span>
                  <span className="c1 t3">{careerSpan(item)}</span>
                  {item.description ? <span className="b2 t2">{item.description}</span> : null}
                </span>
                <button type="button" className="btn sec sm" onClick={() => setCareer({ index })}>
                  <Icon name="pencil" size={15} />
                  {PROFILE_EDIT}
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn line sm mp-career-add"
              onClick={() => setCareer({ index: null })}
            >
              <Icon name="plus" size={16} />
              {CAREER_ADD}
            </button>
          </div>
        </div>
        <div>
          <span className="mp-lbl">{PROFILE_FIELDS.skills}</span>
          <SkillEditor skills={draft.skills} onChange={(skills) => patch({ skills })} />
        </div>
        <div className="mp-actions">
          <button type="button" className="btn sec" onClick={onCancel}>
            {CANCEL_LABEL}
          </button>
          <button type="submit" className="btn pri" disabled={busy || !draft.displayName.trim()}>
            {SAVE_LABEL}
          </button>
        </div>
      </form>
      {career ? (
        <CareerDialog
          career={editing}
          onSave={saveCareer}
          onRemove={
            career.index == null
              ? undefined
              : () => {
                  patch({ careers: draft.careers.filter((_, at) => at !== career.index) })
                  setCareer(null)
                }
          }
          onClose={() => setCareer(null)}
        />
      ) : null}
    </div>
  )
}

export default ProfileEditForm
