import type { EmployerStage } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api'
import { EMPLOYER_STAGE_ACTIONS } from '../../shared/model/applicant-stage'
import ApplicantRow from './applicant-row'
import {
  APPLICANT_FILTER_ALL,
  APPLICANTS_EMPTY,
  APPLICANTS_FAILED,
  APPLICANTS_LOADING,
  APPLICANTS_TITLE,
} from './constants'

const ApplicantsPage = () => {
  const { id } = useParams()
  const [stage, setStage] = useState<EmployerStage | null>(null)
  const applicants = useQuery({
    queryKey: ['employer-applicants', id, stage],
    queryFn: () => api.postings.applicants(id ?? '', stage ? { stage } : {}),
    enabled: Boolean(id),
  })
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{APPLICANTS_TITLE}</h1>
      </header>
      <div className="chips">
        <button type="button" className="chip" aria-pressed={stage === null} onClick={() => setStage(null)}>
          {APPLICANT_FILTER_ALL}
        </button>
        {EMPLOYER_STAGE_ACTIONS.map((action) => (
          <button
            key={action.stage}
            type="button"
            className="chip"
            aria-pressed={stage === action.stage}
            onClick={() => setStage(action.stage)}
          >
            {action.label}
          </button>
        ))}
      </div>
      {applicants.isError || !id ? (
        <p className="b1 stack" role="alert">
          {APPLICANTS_FAILED}
        </p>
      ) : !applicants.data ? (
        <p className="b2 t3 stack">{APPLICANTS_LOADING}</p>
      ) : applicants.data.data.length === 0 ? (
        <p className="b2 t3 stack">{APPLICANTS_EMPTY}</p>
      ) : (
        <ul className="activity-list stack">
          {applicants.data.data.map((applicant) => (
            <ApplicantRow key={applicant.applicationId} postingId={id} applicant={applicant} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default ApplicantsPage
