import type { ApplicantSummary, ApplicationStage, EmployerStage } from '@push/api-client'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useApplicantCounts, employerStageLabel, useEmployerApplicants } from '../../entities/application'
import { useEmployerPosting } from '../../entities/posting'
import { Icon } from '../../shared/ui/icon'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import ApplicantRow from './applicant-row'
import { stageTabs } from './applicant-view'
import {
  APPLICANTS_EMPTY,
  APPLICANTS_EMPTY_BODY,
  APPLICANTS_FAILED,
  APPLICANTS_HEAD,
  APPLICANTS_LOADING,
  APPLICANTS_NOTE,
  APPLICANTS_TITLE,
  POSTINGS_TITLE,
  STAGE_RETRY,
  VIEW_POSTING,
  stageEmpty,
  stageMoved,
  stageNotMoved,
} from './constants'
import { STATUS_BADGE, statusOf } from './posting-view'
import { useStageMove } from './use-stage-move'

const ApplicantsPage = () => {
  const { id } = useParams()
  const [stage, setStage] = useState<ApplicationStage | null>(null)
  const toast = useToast()
  const posting = useEmployerPosting(id)
  const counts = useApplicantCounts(id)
  const applicants = useEmployerApplicants(id, stage)
  const move = useStageMove(id)
  const tabs = stageTabs(counts.data)
  const badge = posting.data ? STATUS_BADGE[statusOf(posting.data)] : null
  const moveTo = (row: ApplicantSummary, next: EmployerStage) => {
    const name = row.applicant.displayName
    const label = employerStageLabel(next)
    move.mutate(
      { applicationId: row.applicationId, stage: next },
      {
        onSuccess: () => toast.show(stageMoved(name, label)),
        onError: () => toast.show(stageNotMoved(name, label), { tone: 'err', action: { label: STAGE_RETRY, onClick: () => moveTo(row, next) } }),
      },
    )
  }
  const rows = applicants.data?.data ?? []
  return (
    <main className="page biz-page">
      <header className="head">
        <h1 className="h1">{APPLICANTS_TITLE}</h1>
      </header>
      <nav className="biz-crumb b2 t3" aria-label={POSTINGS_TITLE}>
        <Link className="t3" to="/employer/postings">
          {POSTINGS_TITLE}
        </Link>
        {posting.data && badge ? (
          <>
            <Icon name="next" size={16} width={2.2} />
            <span className="w7 biz-crumb-now">{posting.data.title}</span>
            <span className={`badge ${badge.tone}`}>{badge.label}</span>
          </>
        ) : null}
      </nav>
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button key={tab.label} type="button" role="tab" aria-selected={stage === tab.stage} onClick={() => setStage(tab.stage)}>
            {tab.label}
            {tab.count === undefined ? null : <> <span className="num">{tab.count}</span></>}
          </button>
        ))}
      </div>
      {applicants.isError || !id ? (
        <ErrorState title={APPLICANTS_FAILED} onRetry={() => void applicants.refetch()} boxed />
      ) : !applicants.data ? (
        <p className="b2 t3 stack">{APPLICANTS_LOADING}</p>
      ) : rows.length === 0 ? (
        <StateBlock
          icon="people"
          boxed
          title={stage ? stageEmpty(tabs.find((tab) => tab.stage === stage)?.label ?? '') : APPLICANTS_EMPTY}
          description={stage ? undefined : APPLICANTS_EMPTY_BODY}
          action={
            stage ? undefined : (
              <Link className="btn sec sm" to={`/postings/${id}`}>
                {VIEW_POSTING}
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="box biz-card applicants-cols">
            <div className="biz-head c1 w7 t3" aria-hidden="true">
              <span className="biz-av" />
              <span className="biz-main">{APPLICANTS_HEAD[0]}</span>
              <span className="biz-docs">{APPLICANTS_HEAD[1]}</span>
              <span className="biz-date">{APPLICANTS_HEAD[2]}</span>
              <span className="stage-pick">{APPLICANTS_HEAD[3]}</span>
            </div>
            <ul className="biz-list">
              {rows.map((row) => (
                <ApplicantRow key={row.applicationId} postingId={id} applicant={row} busy={move.isPending} onMove={moveTo} />
              ))}
            </ul>
          </div>
          <p className="c1 t3">{APPLICANTS_NOTE}</p>
        </>
      )}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </main>
  )
}

export default ApplicantsPage
