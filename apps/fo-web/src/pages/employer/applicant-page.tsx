import { ApiError, type EmployerStage } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { NAV } from '../../app/constants'
import { employerStageLabel, postingsApplicantFile, useEmployerApplicant, useEmployerApplicants } from '../../entities/application'
import { saveFile } from '../../shared/lib/save-file'
import { EMPLOYER_STAGE_ACTIONS, stageChangeBlocked } from '../../shared/model/applicant-stage'
import { AgentMark, Icon } from '../../shared/ui/icon'
import { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import ApplicantDocument from './applicant-document'
import { applicantSub, docChips } from './applicant-view'
import {
  AI_INTERVIEW,
  AI_REVIEW,
  APPLICANT_FAILED,
  APPLICANT_LOADING,
  DOCS_NONE,
  HUB_PROFILE,
  POSTINGS_TITLE,
  STAGE_APPLIED,
  STAGE_ENDED,
  STAGE_RETRY,
  STAGE_RETRY_NOTE,
  STAGE_TITLE,
  APPLICANTS_TITLE,
  FILE_FAILED,
  memberInitials,
  stageFailed,
  stageMoved,
  stageNotice,
  submittedAsIs,
} from './constants'
import { dateLabel } from './posting-view'
import StageMenu from './stage-menu'
import { useStageMove } from './use-stage-move'

type Failure = { stage: EmployerStage; ended: boolean }

const ApplicantPage = () => {
  const { id, applicationId } = useParams()
  const toast = useToast()
  const [failure, setFailure] = useState<Failure | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const detail = useEmployerApplicant(id, applicationId)
  const listed = useEmployerApplicants(id, null)
  const move = useStageMove(id)
  const download = useMutation({
    mutationFn: async (file: { id: string; name: string }) =>
      saveFile(await (await postingsApplicantFile(id ?? '', applicationId ?? '', file.id)).blob(), file.name),
    onError: () => toast.show(FILE_FAILED, { tone: 'err' }),
  })
  if (!id || !applicationId || detail.isError) {
    return (
      <main className="page biz-page">
        <ErrorState title={APPLICANT_FAILED} onRetry={() => void detail.refetch()} boxed />
      </main>
    )
  }
  if (!detail.data) {
    return (
      <main className="page biz-page" aria-busy="true">
        <p className="b2 t3 stack">{APPLICANT_LOADING}</p>
      </main>
    )
  }
  const { application, applicant: profile } = detail.data
  const summary = listed.data?.data.find((item) => item.applicationId === applicationId)
  const name = profile?.displayName || summary?.applicant.displayName || ''
  const chips = docChips(detail.data)
  const chip = chips.find((item) => item.key === picked) ?? chips[0]
  const label = employerStageLabel(application.stage)
  const blocked = move.isPending || stageChangeBlocked(application.stage)
  const applied = application.appliedAt ? dateLabel(application.appliedAt) : ''
  const sub = [summary ? applicantSub({ ...summary.applicant, headline: null }) : '', applied ? `${applied} 지원` : ''].filter(Boolean).join(' · ')
  const change = (stage: EmployerStage) => {
    setFailure(null)
    move.mutate(
      { applicationId, stage },
      {
        onSuccess: () => toast.show(stageMoved(name, employerStageLabel(stage))),
        onError: (error) => setFailure({ stage, ended: error instanceof ApiError && error.code === 'INVALID_TRANSITION' }),
      },
    )
  }
  const stages = [{ label: STAGE_APPLIED, stage: null }, ...EMPLOYER_STAGE_ACTIONS]
  return (
    <main className="page biz-page">
      <header className="head">
        <h1 className="h1">{name || application.title}</h1>
      </header>
      <nav className="biz-crumb b2 t3" aria-label={POSTINGS_TITLE}>
        <Link className="t3" to="/employer/postings">
          {POSTINGS_TITLE}
        </Link>
        <Icon name="next" size={16} width={2.2} />
        <Link className="t3" to={`/employer/postings/${id}/applicants`}>
          {application.title}
        </Link>
        <Icon name="next" size={16} width={2.2} />
        <span className="w7 biz-crumb-now">{APPLICANTS_TITLE}</span>
      </nav>
      <div className="biz-split">
        <section className="resume">
          {chip ? (
            <>
              <div className="resume-bar">
                {chips.map((item) => (
                  <button key={item.key} type="button" className="chip" aria-pressed={item.key === chip.key} onClick={() => setPicked(item.key)}>
                    {item.label}
                    <span className={`badge ${item.badge.tone}`}>{item.badge.label}</span>
                  </button>
                ))}
                {applied ? <span className="c1 t3 resume-note">{submittedAsIs(applied)}</span> : null}
              </div>
              <div className="card resume-stage">
                <ApplicantDocument
                  chip={chip}
                  name={name}
                  sub={[profile?.headline, summary?.applicant.tenureYears ? `${summary.applicant.tenureYears}년` : '', profile?.email].filter(Boolean).join(' · ')}
                  profile={profile}
                  now={Date.now()}
                  downloading={download.isPending}
                  onDownload={() => chip.file && download.mutate(chip.file)}
                />
              </div>
            </>
          ) : (
            <p className="b2 t3">{DOCS_NONE}</p>
          )}
        </section>
        <aside className="biz-aside">
          <div className="box stage-card">
            <div className="resume-who">
              <span className="av" style={{ background: brandColor(name) }}>
                {memberInitials(name)}
              </span>
              <span>
                <span className="b1 w7">{name}</span>
                <span className="c1 t3">{sub}</span>
              </span>
            </div>
            {profile?.hubProfileId ? (
              <Link className="chip" to={`/profiles/${profile.hubProfileId}`}>
                {HUB_PROFILE}
              </Link>
            ) : null}
            <div className="biz-hr" />
            <span className="b2 w7">{STAGE_TITLE}</span>
            <div className="stage-list" role="radiogroup" aria-label={STAGE_TITLE} aria-busy={move.isPending}>
              {stages.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="radio"
                  aria-checked={label === item.label}
                  className="stage-radio b2 w7"
                  disabled={blocked || !item.stage || label === item.label}
                  onClick={() => item.stage && change(item.stage)}
                >
                  <i className="stage-rd" />
                  {item.label}
                </button>
              ))}
            </div>
            {failure ? (
              <div className="stage-fail c1" role="alert">
                <Icon name="warn" size={18} />
                <span>
                  <span className="t2">
                    <b className="w7">{failure.ended ? STAGE_ENDED : stageFailed(failure.stage)}</b>
                    {failure.ended ? null : ` ${STAGE_RETRY_NOTE}`}
                  </span>
                  {failure.ended ? null : (
                    <button type="button" className="w7 red" onClick={() => change(failure.stage)}>
                      {STAGE_RETRY}
                    </button>
                  )}
                </span>
              </div>
            ) : (
              <p className="c1 t3">{stageNotice(name)}</p>
            )}
          </div>
          <div className="box agent-card">
            <span className="b2 w7 agent-card-title">
              <AgentMark />
              {NAV.chat}
            </span>
            <Link className="btn sec block" to="/employer/chat">
              {AI_REVIEW}
            </Link>
            <Link className="btn sec block" to="/employer/chat">
              {AI_INTERVIEW}
            </Link>
          </div>
        </aside>
      </div>
      <div className="bottom-bar biz-sticky">
        <span className="c1 t3 w7">{STAGE_TITLE}</span>
        <span className="stage-pick">
          <button type="button" className="btn sec lg" aria-haspopup="menu" aria-expanded={menu} disabled={blocked} onClick={() => setMenu((value) => !value)}>
            {label}
            <Icon name="down" size={20} width={2.2} />
          </button>
          {menu ? <StageMenu stage={application.stage} onPick={change} onClose={() => setMenu(false)} /> : null}
        </span>
      </div>
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </main>
  )
}

export default ApplicantPage
