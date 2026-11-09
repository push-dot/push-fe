import { useState } from 'react'

import { Icon } from '../../shared/ui/icon'
import { SKILL_ADD, SKILL_ADD_PLACEHOLDER, SKILL_REMOVE } from './constants'

const SKILL_MAX = 30

const SkillEditor = ({ skills, onChange }: { skills: string[]; onChange: (next: string[]) => void }) => {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    const skill = (draft ?? '').trim()
    if (skill && !skills.includes(skill)) onChange([...skills, skill])
    setDraft(null)
  }
  return (
    <div className="skill-chips">
      {skills.map((skill) => (
        <span key={skill} className="chip">
          {skill}
          <button type="button" className="skill-x" aria-label={`${skill} ${SKILL_REMOVE}`} onClick={() => onChange(skills.filter((item) => item !== skill))}>
            <Icon name="close" size={14} width={2.4} />
          </button>
        </span>
      ))}
      {draft === null ? (
        skills.length < SKILL_MAX ? (
          <button type="button" className="chip skill-add" onClick={() => setDraft('')}>
            <Icon name="plus" size={14} width={2.4} />
            {SKILL_ADD}
          </button>
        ) : null
      ) : (
        <input
          className="skill-input"
          autoFocus
          maxLength={40}
          value={draft}
          placeholder={SKILL_ADD_PLACEHOLDER}
          aria-label={SKILL_ADD}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              commit()
            }
          }}
        />
      )}
    </div>
  )
}

export default SkillEditor
