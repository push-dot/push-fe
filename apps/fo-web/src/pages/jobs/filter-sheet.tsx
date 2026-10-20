import { CAREER_YEARS, EMPLOYMENT_TYPES, JOB_CATEGORIES } from '@push/api-client'
import { useState } from 'react'
import { searchHangul } from '../../shared/lib/hangul-search'
import { FILTER_CHIPS, SKILL_OPTIONS, type FilterKey, type JobFilters } from './constants'

const toggleValue = <T extends string>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

const FilterSheet = ({
  facet,
  draft,
  locations,
  total,
  onChange,
  onClose,
  onApply,
}: {
  facet: FilterKey
  draft: JobFilters
  locations: { location: string; count: number }[]
  total: number
  onChange: (next: JobFilters) => void
  onClose: () => void
  onApply: () => void
}) => {
  const [skillQuery, setSkillQuery] = useState('')
  const title = FILTER_CHIPS.find((chip) => chip.key === facet)?.label ?? ''
  const skills = searchHangul([...SKILL_OPTIONS], skillQuery, (skill) => [skill]).map((row) => row.item)
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <h2 className="h3">{title}</h2>
          <button type="button" className="text-link" onClick={onClose}>
            닫기
          </button>
        </div>
        {facet === 'skills' ? (
          <>
            <div className="sheet-chips">
              {draft.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="chip"
                  aria-pressed="true"
                  onClick={() => onChange({ ...draft, skills: draft.skills.filter((item) => item !== skill) })}
                >
                  {skill}
                </button>
              ))}
            </div>
            <input value={skillQuery} placeholder="기술 스택" onChange={(event) => setSkillQuery(event.target.value)} />
            <div className="option-list">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="option"
                  aria-pressed={draft.skills.includes(skill)}
                  onClick={() => onChange({ ...draft, skills: toggleValue(draft.skills, skill) })}
                >
                  {skill}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {facet === 'category' ? (
          <div className="option-list">
            {JOB_CATEGORIES.map((item) => (
              <button
                key={item.key}
                type="button"
                className="option"
                aria-pressed={draft.category.includes(item.key)}
                onClick={() => onChange({ ...draft, category: toggleValue(draft.category, item.key) })}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {facet === 'career' ? (
          <div className="option-list">
            {CAREER_YEARS.map((item) => (
              <button
                key={item.key}
                type="button"
                className="option"
                aria-pressed={draft.careerYears.includes(item.key)}
                onClick={() => onChange({ ...draft, careerYears: toggleValue(draft.careerYears, item.key) })}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {facet === 'employment' ? (
          <div className="option-list">
            {EMPLOYMENT_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                className="option"
                aria-pressed={draft.employmentType.includes(item.key)}
                onClick={() => onChange({ ...draft, employmentType: toggleValue(draft.employmentType, item.key) })}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {facet === 'location' ? (
          <div className="option-list">
            {locations.map((item) => (
              <button
                key={item.location}
                type="button"
                className="option"
                aria-pressed={draft.location.includes(item.location)}
                onClick={() => onChange({ ...draft, location: toggleValue(draft.location, item.location) })}
              >
                <span>{item.location}</span>
                <span className="c1 t3">{item.count}</span>
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" className="primary" onClick={onApply}>
          {`공고 ${total}개 보기`}
        </button>
      </div>
    </div>
  )
}

export default FilterSheet
