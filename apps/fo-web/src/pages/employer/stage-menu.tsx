import type { EmployerStage } from '@push/api-client'

import { employerStageLabel } from '../../entities/application'
import { EMPLOYER_STAGE_ACTIONS, type ApplicationStage } from '../../shared/model/applicant-stage'
import { Icon } from '../../shared/ui/icon'
import { Popover } from '../../shared/ui/popover'
import { STAGE_TITLE } from './constants'

// The stages push-be accepts from an employer; 지원함 is where an application starts, so it is not a choice.
const StageMenu = ({ stage, onPick, onClose }: { stage: ApplicationStage; onPick: (next: EmployerStage) => void; onClose: () => void }) => {
  const current = employerStageLabel(stage)
  return (
    <Popover label={STAGE_TITLE} onClose={onClose} className="stage-pop">
      <div className="menu" role="menu">
        {EMPLOYER_STAGE_ACTIONS.map((action) => (
          <button
            key={action.stage}
            type="button"
            role="menuitemradio"
            aria-checked={current === action.label}
            className="mi"
            onClick={() => {
              onClose()
              if (current !== action.label) onPick(action.stage)
            }}
          >
            <span className="w6">{action.label}</span>
            {current === action.label ? <Icon name="check" size={18} width={2.6} /> : null}
          </button>
        ))}
      </div>
    </Popover>
  )
}

export default StageMenu
