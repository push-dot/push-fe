import { useState } from 'react'
import { Icon } from '../../shared/ui/icon'
import { SKILL_ADD, SKILL_PLACEHOLDER, SKILL_REMOVE } from './constants'

const SkillEditor = ({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) => {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')
  const commit = () => {
    const skill = value.trim()
    if (skill && !skills.includes(skill)) onChange([...skills, skill])
    setValue('')
    setAdding(false)
  }
  return (
    <div className="skill-row">
      {skills.map((skill) => (
        <span className="chip" key={skill}>
          {skill}
          <button
            type="button"
            className="mp-chip-x"
            aria-label={SKILL_REMOVE(skill)}
            onClick={() => onChange(skills.filter((item) => item !== skill))}
          >
            <Icon name="close" size={14} />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          className="chip mp-chip-input"
          value={value}
          placeholder={SKILL_PLACEHOLDER}
          aria-label={SKILL_PLACEHOLDER}
          onChange={(event) => setValue(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
            if (event.key === 'Escape') {
              setValue('')
              setAdding(false)
            }
          }}
        />
      ) : (
        <button type="button" className="chip mp-chip-add" onClick={() => setAdding(true)}>
          <Icon name="plus" size={14} />
          {SKILL_ADD}
        </button>
      )}
    </div>
  )
}

export default SkillEditor
