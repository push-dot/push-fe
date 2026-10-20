import type { EmployerStage } from '@push/api-client'
import { EMPLOYER_STAGE_ACTIONS, stageChangeBlocked, type ApplicationStage } from '../../shared/model/applicant-stage'

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
  return (
    <div className="auth-actions stack">
      {EMPLOYER_STAGE_ACTIONS.map((action) => (
        <button key={action.stage} type="button" className="primary" disabled={blocked || pending} onClick={() => onChange(action.stage)}>
          {action.label}
        </button>
      ))}
    </div>
  )
}

export default ApplicantStageActions
