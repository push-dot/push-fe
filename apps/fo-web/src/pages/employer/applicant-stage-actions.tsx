import type { EmployerStage } from '@push/api-client'
import { EMPLOYER_STAGE_ACTIONS, stageChangeBlocked, type ApplicationStage } from '../../shared/model/applicant-stage'
import { STAGE_APPLIED } from './constants'
import { employerStageLabel } from './stage-label'

const ApplicantStageActions = ({
  stage,
  pending,
  onChange,
}: {
  stage: ApplicationStage
  pending: boolean
  onChange: (next: EmployerStage) => void
}) => {
  const blocked = stageChangeBlocked(stage)
  const current = employerStageLabel(stage)
  return (
    <div className="stage-list" role="group" aria-label="단계">
      <span className={current === STAGE_APPLIED ? 'on' : ''}>{STAGE_APPLIED}</span>
      {EMPLOYER_STAGE_ACTIONS.map((action) => (
        <button key={action.stage} type="button" aria-pressed={current === action.label} disabled={blocked || pending || current === action.label} onClick={() => onChange(action.stage)}>
          {action.label}
        </button>
      ))}
    </div>
  )
}

export default ApplicantStageActions
