import { CAREER_YEARS, EMPLOYMENT_TYPES, JOB_CATEGORIES } from '@push/api-client'
import { searchHangul } from '@push/shared'
import { useState } from 'react'

import { Icon } from '../../shared/ui/icon'
import { Popover } from '../../shared/ui/popover'
import { FILTER_CHIPS, FILTER_FIELD, SKILL_OPTIONS, SKILL_SEARCH, type FilterKey, type JobFilters } from './constants'

type Option = { value: string; label: string; count?: number }

const optionsFor = (facet: FilterKey, locations: { location: string; count: number }[], skillQuery: string): Option[] => {
  if (facet === 'category') return JOB_CATEGORIES.map((item) => ({ value: item.key, label: item.label }))
  if (facet === 'career') return CAREER_YEARS.map((item) => ({ value: item.key, label: item.label }))
  if (facet === 'employment') return EMPLOYMENT_TYPES.map((item) => ({ value: item.key, label: item.label }))
  if (facet === 'location') return locations.map((item) => ({ value: item.location, label: item.location, count: item.count }))
  return searchHangul([...SKILL_OPTIONS], skillQuery, (skill) => [skill]).map((row) => ({ value: row.item, label: row.item }))
}

const FilterPopover = ({
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
  const field = FILTER_FIELD[facet]
  const selected: string[] = draft[field]
  const change = (values: string[]) => onChange({ ...draft, [field]: values } as JobFilters)
  return (
    <Popover label={title} onClose={onClose} className="jobs-pop">
      <div className="b2 w7 jobs-pop-title">{title}</div>
      {facet === 'skills' ? (
        <label className="search-field jobs-pop-search">
          <Icon name="search" size={20} />
          <input value={skillQuery} placeholder={SKILL_SEARCH} onChange={(event) => setSkillQuery(event.target.value)} />
        </label>
      ) : null}
      {optionsFor(facet, locations, skillQuery).map((option) => {
        const on = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={on}
            className="jobs-opt"
            onClick={() => change(on ? selected.filter((item) => item !== option.value) : [...selected, option.value])}
          >
            <span className={on ? 'jobs-ck on' : 'jobs-ck'}>{on ? <Icon name="check" size={14} width={3} /> : null}</span>
            <span className="b2">{option.label}</span>
            {option.count === undefined ? null : <span className="c1 t4 num">{option.count}</span>}
          </button>
        )
      })}
      <div className="jobs-pop-actions">
        <button type="button" className="btn sec sm" onClick={() => change([])}>
          초기화
        </button>
        <button type="button" className="btn pri sm" onClick={onApply}>
          {`공고 ${total}개 보기`}
        </button>
      </div>
    </Popover>
  )
}

export default FilterPopover
