import {
  EMPLOYMENT_TYPES,
  JOB_CATEGORIES,
  type CreatePostingInput,
  type EmploymentType,
  type JobCategory,
  type PostingDetail,
} from '@push/api-client'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useSession } from '../../shared/auth/use-session'
import {
  CLOSE_POSTING,
  CLOSED_STATE,
  COMPANY_NAME_NOTE,
  CREATE_POSTING,
  EDITOR_LOADING,
  EDITOR_TITLE,
  LABEL_CAREER_MIN,
  LABEL_DEADLINE,
  LABEL_DESCRIPTION,
  LABEL_EMPLOYMENT_TYPE,
  LABEL_JOB_CATEGORY,
  LABEL_LOCATION,
  LABEL_PREFERRED,
  LABEL_REQUIREMENTS,
  LABEL_TITLE,
  LABEL_WORK_CONDITIONS,
  NEW_POSTING,
  POSTINGS_FAILED,
  POSTINGS_TITLE,
  SAVE_POSTING,
} from './constants'
import { editorFailure } from './editor-failure'
import { useMyCompany } from '../../entities/company'
import { conditionsFromText, draftFields, listFromLines, useEmployerPosting } from '../../entities/posting'
import { postingsUpdate, postingsCreate, postingsClose } from '../../shared/api/operations'


type EditorForm = {
  title: string
  description: string
  requirements: string
  preferred: string
  workConditions: string
  jobCategory: JobCategory
  careerMin: string
  location: string
  employmentType: EmploymentType
  deadline: string
}

const emptyForm = (): EditorForm => ({
  title: '',
  description: '',
  requirements: '',
  preferred: '',
  workConditions: '',
  jobCategory: 'dev',
  careerMin: '0',
  location: '',
  employmentType: 'full_time',
  deadline: '',
})

const careerMinOf = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formFromDetail = (posting: PostingDetail): EditorForm => ({
  ...emptyForm(),
  ...draftFields({
    title: posting.title,
    description: posting.description,
    requirements: posting.requirements,
    preferred: posting.preferred,
    workConditions: posting.workConditions,
  }),
  jobCategory: posting.jobCategory,
  careerMin: String(posting.careerMin),
  location: posting.location,
  employmentType: posting.employmentType,
  deadline: posting.deadline ?? '',
})

const toInput = (form: EditorForm): CreatePostingInput => ({
  title: form.title.trim(),
  description: form.description,
  requirements: listFromLines(form.requirements),
  preferred: listFromLines(form.preferred),
  workConditions: conditionsFromText(form.workConditions),
  jobCategory: form.jobCategory,
  careerMin: careerMinOf(form.careerMin),
  location: form.location.trim(),
  employmentType: form.employmentType,
  deadline: form.deadline || null,
})

const PostingEditorPage = () => {
  const session = useSession()
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const seeded =
    !id && location.state && typeof location.state === 'object'
      ? draftFields(location.state as Record<string, unknown>)
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
    mutationFn: () => {
      const body = toInput(formRef.current)
      return id ? postingsUpdate(id, { ...body, expectedRevision: revisionRef.current }) : postingsCreate(body)
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
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.title.trim().length === 0 || save.isPending) return
    setError(null)
    save.mutate()
  }
  const patch = (next: Partial<EditorForm>) => setForm((current) => ({ ...current, ...next }))
  if (id && detail.isError) {
    return (
      <main className="page">
        <header className="head">
          <h1 className="h1">{POSTINGS_TITLE}</h1>
        </header>
        <p className="b1 stack" role="alert">
          {POSTINGS_FAILED}
        </p>
      </main>
    )
  }
  if (id && readyFor !== id) {
    return (
      <main className="page" aria-busy="true">
        <p className="b2 t3 stack">{EDITOR_LOADING}</p>
      </main>
    )
  }
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{id ? EDITOR_TITLE : NEW_POSTING}</h1>
      </header>
      {closedAt ? <p className="b1 stack">{CLOSED_STATE}</p> : null}
      <form className="stack biz-form" onSubmit={submit}>
        <label className="biz-field">
          {LABEL_TITLE}
          <input value={form.title} onChange={(event) => patch({ title: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_DESCRIPTION}
          <textarea rows={5} value={form.description} onChange={(event) => patch({ description: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_REQUIREMENTS}
          <textarea rows={4} value={form.requirements} onChange={(event) => patch({ requirements: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_PREFERRED}
          <textarea rows={4} value={form.preferred} onChange={(event) => patch({ preferred: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_WORK_CONDITIONS}
          <textarea rows={3} value={form.workConditions} onChange={(event) => patch({ workConditions: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_JOB_CATEGORY}
          <select value={form.jobCategory} onChange={(event) => patch({ jobCategory: event.target.value as JobCategory })}>
            {JOB_CATEGORIES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="biz-field">
          {LABEL_CAREER_MIN}
          <input type="number" min={0} value={form.careerMin} onChange={(event) => patch({ careerMin: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_LOCATION}
          <input value={form.location} onChange={(event) => patch({ location: event.target.value })} />
        </label>
        <label className="biz-field">
          {LABEL_EMPLOYMENT_TYPE}
          <select value={form.employmentType} onChange={(event) => patch({ employmentType: event.target.value as EmploymentType })}>
            {EMPLOYMENT_TYPES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="biz-field">
          {LABEL_DEADLINE}
          <input type="date" value={form.deadline} onChange={(event) => patch({ deadline: event.target.value })} />
        </label>
        {company.data ? (
          <p className="b2">
            <span className="t3">회사명 </span>
            {company.data.name}
          </p>
        ) : null}
        <p className="c1 t3">{COMPANY_NAME_NOTE}</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="biz-actions">
          <button type="submit" className="btn pri" disabled={form.title.trim().length === 0 || save.isPending}>
            {id ? SAVE_POSTING : CREATE_POSTING}
          </button>
          {id ? (
            <button type="button" className="btn sec" disabled={Boolean(closedAt) || close.isPending} onClick={() => close.mutate()}>
              {CLOSE_POSTING}
            </button>
          ) : null}
        </div>
      </form>
    </main>
  )
}

export default PostingEditorPage
