import {
  EMPLOYMENT_TYPES,
  JOB_CATEGORIES,
  type CreatePostingInput,
  type EmploymentType,
  type JobCategory,
  type PostingDetail,
} from '@push/api-client'
import { brandColor } from '@push/shared'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useSession } from '../../shared/auth/use-session'
import { Icon } from '../../shared/ui/icon'
import { ErrorState } from '../../shared/ui/state-block'
import BulletField from './bullet-field'
import { CAREER_RANGES, CLOSE_POSTING, CLOSED_STATE, COMPANY_NAME_NOTE, EDITOR_LOADING, EDITOR_TITLE, LABEL_CAREER, LABEL_COMPANY, LABEL_DEADLINE, LABEL_DESCRIPTION, LABEL_EMPLOYMENT_TYPE, LABEL_IMAGE, LABEL_JOB_CATEGORY, LABEL_LOCATION, LABEL_PREFERRED, LABEL_REQUIREMENTS, LABEL_SKILLS, LABEL_TITLE, AI_POLISH, IMAGE_CHANGE, IMAGE_FAILED, NEW_POSTING, POSTINGS_FAILED, PREVIEW_POSTING, SAVE_DRAFT, SAVE_POSTING } from './constants'
import { careerRangeOf, stripBullets, withBullets } from './editor-form'
import SkillEditor from './skill-editor'
import { editorFailure, postingsClose, postingsCreate, postingsUpdate, uploadsImage } from '../../features/edit-posting'
import { useMyCompany } from '../../entities/company'
import { conditionsFromText, draftFields, useEmployerPosting } from '../../entities/posting'

type EditorForm = {
  title: string
  description: string
  requirements: string
  preferred: string
  // Only an agent draft brings these; the board has no field for them, so they are sent on create and left alone on update.
  workConditions: string
  jobCategory: JobCategory
  careerMin: number
  careerMax: number | null
  location: string
  employmentType: EmploymentType
  deadline: string
  skills: string[]
  imageKey: string | null
  imageUrl: string | null
}

const emptyForm = (): EditorForm => ({
  title: '',
  description: '',
  requirements: '',
  preferred: '',
  workConditions: '',
  jobCategory: 'dev',
  careerMin: 0,
  careerMax: null,
  location: '',
  employmentType: 'full_time',
  deadline: '',
  skills: [],
  imageKey: null,
  imageUrl: null,
})

const seededForm = (fields: ReturnType<typeof draftFields>) => ({
  ...fields,
  description: withBullets(fields.description),
  requirements: withBullets(fields.requirements),
  preferred: withBullets(fields.preferred),
})

const formFromDetail = (posting: PostingDetail): EditorForm => ({
  ...emptyForm(),
  ...seededForm(
    draftFields({
      title: posting.title,
      description: posting.description,
      requirements: posting.requirements,
      preferred: posting.preferred,
    }),
  ),
  workConditions: '',
  jobCategory: posting.jobCategory,
  careerMin: posting.careerMin,
  careerMax: posting.careerMax,
  location: posting.location,
  employmentType: posting.employmentType,
  deadline: posting.deadline ?? '',
  skills: posting.skills,
  imageUrl: posting.imageUrl,
})

const toInput = (form: EditorForm, create: boolean): CreatePostingInput => ({
  title: form.title.trim(),
  description: stripBullets(form.description).join('\n'),
  requirements: stripBullets(form.requirements),
  preferred: stripBullets(form.preferred),
  ...(create && form.workConditions.trim() ? { workConditions: conditionsFromText(form.workConditions) } : {}),
  jobCategory: form.jobCategory,
  careerMin: form.careerMin,
  careerMax: form.careerMax,
  location: form.location.trim(),
  employmentType: form.employmentType,
  deadline: form.deadline || null,
  skills: form.skills,
  ...(form.imageKey ? { imageKey: form.imageKey } : {}),
})

const PostingEditorPage = () => {
  const session = useSession()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const seeded =
    !id && location.state && typeof location.state === 'object'
      ? seededForm(draftFields(location.state as Record<string, unknown>))
      : null
  const [form, setForm] = useState<EditorForm>({ ...emptyForm(), ...(seeded ?? {}) })
  const [readyFor, setReadyFor] = useState<string | null>(id ? null : 'new')
  const [closedAt, setClosedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const revisionRef = useRef(0)
  const formRef = useRef(form)
  formRef.current = form
  const company = useMyCompany({ enabled: Boolean(session?.user.companyId) })
  const detail = useEmployerPosting(id)
  useEffect(() => {
    if (!id || !detail.data || detail.data.id !== id || readyFor === id) return
    setForm(formFromDetail(detail.data))
    revisionRef.current = detail.data.revision ?? 0
    setClosedAt(detail.data.closedAt ?? null)
    setReadyFor(id)
  }, [detail.data, id, readyFor])
  const save = useMutation({
    mutationFn: (status: 'OPEN' | 'DRAFT') => {
      const body = toInput(formRef.current, !id)
      // A closed posting cannot go back to OPEN or DRAFT, so it keeps its status.
      const withStatus = closedAt ? body : { ...body, status }
      return id ? postingsUpdate(id, { ...withStatus, expectedRevision: revisionRef.current }) : postingsCreate(withStatus)
    },
    onSuccess: () => navigate('/employer/postings'),
    onError: (error) => setError(editorFailure(error)),
  })
  const close = useMutation({
    mutationFn: () => postingsClose(id ?? '', revisionRef.current),
    onSuccess: (posting) => {
      revisionRef.current = posting.revision ?? revisionRef.current + 1
      setClosedAt(posting.closedAt ?? new Date().toISOString())
      setError(null)
    },
    onError: (error) => setError(editorFailure(error)),
  })
  const upload = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData()
      body.append('file', file)
      return uploadsImage(body)
    },
    onSuccess: ({ key, url }) => setForm((current) => ({ ...current, imageKey: key, imageUrl: url })),
    onError: () => setError(IMAGE_FAILED),
  })
  const submit = (status: 'OPEN' | 'DRAFT') => {
    if (formRef.current.title.trim().length === 0 || save.isPending) return
    setError(null)
    save.mutate(status)
  }
  const patch = (next: Partial<EditorForm>) => setForm((current) => ({ ...current, ...next }))
  if (id && detail.isError) {
    return (
      <main className="page biz-page">
        <h1 className="h1">{EDITOR_TITLE}</h1>
        <ErrorState title={POSTINGS_FAILED} onRetry={() => void detail.refetch()} boxed />
      </main>
    )
  }
  if (id && readyFor !== id) {
    return (
      <main className="page biz-page" aria-busy="true">
        <p className="b2 t3 stack">{EDITOR_LOADING}</p>
      </main>
    )
  }
  const companyName = company.data?.legalName ?? company.data?.name ?? ''
  const range = careerRangeOf(form.careerMin)
  const disabled = form.title.trim().length === 0 || save.isPending
  const polish = id ? `/employer/chat/new?postingId=${id}` : null
  const bulleted = (label: string, key: 'description' | 'requirements' | 'preferred') => (
    <div className="editor-field">
      <span className="editor-label">
        {label}
        {polish ? (
          <Link className="c1 w7 ac editor-polish" to={polish}>
            <Icon name="spark" size={14} filled />
            {AI_POLISH}
          </Link>
        ) : null}
      </span>
      <BulletField value={form[key]} onChange={(next) => patch({ [key]: next })} />
    </div>
  )
  const actions = (
    <>
      <button type="submit" form="posting-form" className="btn pri lg" disabled={disabled}>
        {SAVE_POSTING}
      </button>
      <button type="button" className="btn sec" disabled={disabled || Boolean(closedAt)} onClick={() => submit('DRAFT')}>
        {SAVE_DRAFT}
      </button>
    </>
  )
  return (
    <main className="page biz-page">
      <header className="head biz-bar">
        <h1 className="h1">{id ? EDITOR_TITLE : NEW_POSTING}</h1>
        {id ? (
          <Link className="btn sec sm" to={`/postings/${id}`}>
            <Icon name="eye" size={16} width={2.2} />
            {PREVIEW_POSTING}
          </Link>
        ) : null}
      </header>
      {closedAt ? <p className="b1 stack">{CLOSED_STATE}</p> : null}
      <div className="editor">
        <form
          id="posting-form"
          className="editor-form"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            submit('OPEN')
          }}
        >
          <label className="field">
            <span>{LABEL_TITLE}</span>
            <input value={form.title} onChange={(event) => patch({ title: event.target.value })} />
          </label>
          <div className="editor-row three">
            <label className="field editor-select">
              <span>{LABEL_JOB_CATEGORY}</span>
              <select value={form.jobCategory} onChange={(event) => patch({ jobCategory: event.target.value as JobCategory })}>
                {JOB_CATEGORIES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Icon name="down" size={20} width={2.2} />
            </label>
            <label className="field editor-select">
              <span>{LABEL_CAREER}</span>
              <select
                value={range.label}
                onChange={(event) => {
                  const next = CAREER_RANGES.find((item) => item.label === event.target.value) ?? CAREER_RANGES[0]
                  patch({ careerMin: next.min, careerMax: next.max })
                }}
              >
                {CAREER_RANGES.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Icon name="down" size={20} width={2.2} />
            </label>
            <label className="field editor-select">
              <span>{LABEL_EMPLOYMENT_TYPE}</span>
              <select value={form.employmentType} onChange={(event) => patch({ employmentType: event.target.value as EmploymentType })}>
                {EMPLOYMENT_TYPES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
              <Icon name="down" size={20} width={2.2} />
            </label>
          </div>
          <div className="editor-row two">
            <label className="field">
              <span>{LABEL_LOCATION}</span>
              <input value={form.location} onChange={(event) => patch({ location: event.target.value })} />
            </label>
            <label className="field">
              <span>{LABEL_DEADLINE}</span>
              <input type="date" value={form.deadline} onChange={(event) => patch({ deadline: event.target.value })} />
            </label>
          </div>
          {bulleted(LABEL_DESCRIPTION, 'description')}
          {bulleted(LABEL_REQUIREMENTS, 'requirements')}
          {bulleted(LABEL_PREFERRED, 'preferred')}
          <div className="editor-field">
            <span>{LABEL_SKILLS}</span>
            <SkillEditor skills={form.skills} onChange={(skills) => patch({ skills })} />
          </div>
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
        <aside className="biz-aside editor-aside">
          <div className="box editor-card">
            <span className="b2 w7">{LABEL_IMAGE}</span>
            <div className="editor-tile" style={{ background: brandColor(company.data?.name ?? 'push') }}>
              {form.imageUrl ? <img src={form.imageUrl} alt="" /> : <b>{[...companyName][0] ?? ''}</b>}
            </div>
            <label className="btn sec sm editor-image">
              <Icon name="image" size={16} />
              {IMAGE_CHANGE}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={upload.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) upload.mutate(file)
                  event.target.value = ''
                }}
              />
            </label>
            <div className="biz-hr" />
            <div className="editor-company c1 t3">
              <span>{LABEL_COMPANY}</span>
              <span className="w7">{companyName}</span>
            </div>
            <div className="editor-actions">{actions}</div>
          </div>
          <p className="c1 t3 editor-note">{COMPANY_NAME_NOTE}</p>
          {id ? (
            <button type="button" className="text-link danger editor-close" disabled={Boolean(closedAt) || close.isPending} onClick={() => close.mutate()}>
              {CLOSE_POSTING}
            </button>
          ) : null}
        </aside>
      </div>
      <div className="bottom-bar biz-sticky editor-bar">
        <label className="btn sec lg msq editor-image" aria-label={IMAGE_CHANGE}>
          <Icon name="image" size={20} />
          <span className="msq-text">{IMAGE_CHANGE}</span>
          <input type="file" accept="image/*" className="sr-only" disabled={upload.isPending} onChange={(event) => event.target.files?.[0] && upload.mutate(event.target.files[0])} />
        </label>
        <button type="button" className="btn sec lg" disabled={disabled || Boolean(closedAt)} onClick={() => submit('DRAFT')}>
          {SAVE_DRAFT}
        </button>
        <button type="submit" form="posting-form" className="btn pri lg" disabled={disabled}>
          {SAVE_POSTING}
        </button>
      </div>
    </main>
  )
}

export default PostingEditorPage
