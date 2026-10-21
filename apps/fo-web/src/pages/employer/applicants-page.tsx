import type { ApplicationStage } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api'
import { EMPLOYER_STAGE_ACTIONS } from '../../shared/model/applicant-stage'
import ApplicantRow from './applicant-row'
import { APPLICANTS_EMPTY, APPLICANTS_FAILED, APPLICANTS_LOADING, APPLICANTS_NOTE, APPLICANTS_TITLE, FILTER_ALL, STAGE_APPLIED } from './constants'

const ApplicantsPage = () => {
  const { id } = useParams()
  const [stage, setStage] = useState<ApplicationStage | null>(null)
  const filters = [{ label: FILTER_ALL, stage: null }, { label: STAGE_APPLIED, stage: 'APPLIED' as const }, ...EMPLOYER_STAGE_ACTIONS]
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
        {filters.map((action) => (
          <button key={action.label} type="button" className="chip" aria-pressed={stage === action.stage} onClick={() => setStage(action.stage)}>
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
        <>
          <div className="biz-table-wrap">
            <table className="biz-table">
              <thead>
                <tr>
                  <th>지원자</th>
                  <th>지원일</th>
                  <th>단계</th>
                </tr>
              </thead>
              <tbody>
                {applicants.data.data.map((applicant) => (
                  <ApplicantRow key={applicant.applicationId} postingId={id} applicant={applicant} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="c1 t3">{APPLICANTS_NOTE}</p>
        </>
      )}
    </main>
  )
}

export default ApplicantsPage
