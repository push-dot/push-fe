import { ApiError, type EmployerStage } from '@push/api-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api'
import Toast, { useToast } from '../../shared/ui/toast'
import ApplicantDocument from './applicant-document'
import ApplicantStageActions from './applicant-stage-actions'
import { APPLICANT_FAILED, APPLICANT_LOADING, STAGE_CHANGED, STAGE_ENDED, STAGE_FAILED } from './constants'

const appliedLabel = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day) return iso
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`
}

const ApplicantPage = () => {
  const { id, applicationId } = useParams()
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
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{application.title}</h1>
        <p className="b2">{application.company}</p>
        {application.appliedAt ? <p className="c1 t3">{appliedLabel(application.appliedAt)}</p> : null}
      </header>
      <ul className="doc-list stack">
        {documents.map((document) => (
          <ApplicantDocument key={document.id} title={document.title} content={document.content} />
        ))}
      </ul>
      <ApplicantStageActions stage={application.stage} pending={change.isPending} onChange={(stage) => change.mutate(stage)} />
      {failure ? (
        <p className="auth-error stack" role="alert">
          {failure}
        </p>
      ) : null}
      <Toast message={toast.message} />
    </main>
  )
}

export default ApplicantPage
