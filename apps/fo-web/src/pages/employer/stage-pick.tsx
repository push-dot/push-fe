import type { EmployerStage } from '@push/api-client'
import { useState } from 'react'

import { employerStageLabel } from '../../entities/application'
import { stageChangeBlocked, type ApplicationStage } from '../../shared/model/applicant-stage'
import { Icon } from '../../shared/ui/icon'
import { stageTone } from './applicant-view'
import { stagePickLabel } from './constants'
import StageMenu from './stage-menu'

// The stage cell of a list row: a pill (dot, label, chevron) that opens the stage menu.
const StagePick = ({ name, stage, busy, onPick }: { name: string; stage: ApplicationStage; busy: boolean; onPick: (next: EmployerStage) => void }) => {
  const [open, setOpen] = useState(false)
  const label = employerStageLabel(stage)
  return (
    <span className="stage-pick">
      <button
        type="button"
        className="chip"
        aria-label={stagePickLabel(name, label)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy || stageChangeBlocked(stage)}
        onClick={() => setOpen((value) => !value)}
      >
        <i className={`stage-dot ${stageTone(stage)}`} />
        {label}
        <Icon name="down" size={16} width={2.2} />
      </button>
      {open ? <StageMenu stage={stage} onPick={onPick} onClose={() => setOpen(false)} /> : null}
    </span>
  )
}

export default StagePick
