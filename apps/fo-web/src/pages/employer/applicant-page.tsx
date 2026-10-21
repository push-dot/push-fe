import { ApiError, type EmployerStage } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api'
import Toast, { useToast } from '../../shared/ui/toast'
import ApplicantDocument from './applicant-document'
import ApplicantStageActions from './applicant-stage-actions'
import { AI_INTERVIEW, AI_REVIEW, APPLICANT_FAILED, APPLICANT_LOADING, STAGE_CHANGED, STAGE_ENDED, STAGE_FAILED, stageNotice } from './constants'

const appliedLabel = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day) return iso
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`
}

const ApplicantPage = () => {
  const { id, applicationId } = useParams()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [failure, setFailure] = useState<string | null>(null)
  const detail = useQuery({
    queryKey: ['employer-applicant', id, applicationId],
    queryFn: () => api.postings.applicant(id ?? '', applicationId ?? ''),
    enabled: Boolean(id && applicationId),
  })
  const change = useMutation({
    mutationFn: (stage: EmployerStage) => api.postings.setApplicantStage(id ?? '', applicationId ?? '', stage),
    onSuccess: async () => {
      setFailure(null)
      toast.show(STAGE_CHANGED)
      await detail.refetch()
    },
    onError: (error) => {
      setFailure(error instanceof ApiError && error.code === 'INVALID_TRANSITION' ? STAGE_ENDED : STAGE_FAILED)
    },
  })
  if (!id || !applicationId || detail.isError) {
    return (
      <main className="page">
        <p className="b1 stack" role="alert">
          {APPLICANT_FAILED}
        </p>
      </main>
    )
  }
  if (!detail.data) {
    return (
      <main className="page" aria-busy="true">
        <p className="b2 t3 stack">{APPLICANT_LOADING}</p>
      </main>
    )
  }
  const { application, documents } = detail.data
  const listed = queryClient.getQueriesData<{ data: { applicationId: string; applicant: { displayName: string } }[] }>({ queryKey: ['employer-applicants', id] })
  const person = listed.flatMap(([, value]) => value?.data ?? []).find((item) => item.applicationId === applicationId)?.applicant.displayName ?? ''
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{person || application.title}</h1>
        <p className="b2 t3">{application.title}</p>
        {application.appliedAt ? <p className="c1 t3">{appliedLabel(application.appliedAt)}</p> : null}
      </header>
      <div className="biz-split">
        <ul className="doc-list stack">
          {documents.map((document) => (
            <ApplicantDocument key={document.id} title={document.title} content={document.content} />
          ))}
        </ul>
        <aside className="stage-card">
          <h2 className="h3">단계</h2>
          <ApplicantStageActions stage={application.stage} pending={change.isPending} onChange={(stage) => change.mutate(stage)} />
          <p className="c1 t3">{stageNotice(person)}</p>
          {failure ? (
            <p className="auth-error" role="alert">
              {failure}
            </p>
          ) : null}
          <Link className="btn sec" to="/employer/chat">
            {AI_REVIEW}
          </Link>
          <Link className="btn sec" to="/employer/chat">
            {AI_INTERVIEW}
          </Link>
        </aside>
      </div>
      <Toast message={toast.message} />
    </main>
  )
}

export default ApplicantPage
