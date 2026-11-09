import { brandColor } from '@push/shared'
import type { ApplicantDetail } from '@push/api-client'
import { Fragment } from 'react'

import { Icon } from '../../shared/ui/icon'
import { careerRows, type DocChip } from './applicant-view'
import { DOCUMENT_EMPTY, SHEET_CAREERS, SHEET_INTRO, SHEET_SKILLS, memberInitials } from './constants'

type Profile = NonNullable<ApplicantDetail['applicant']>

// The white sheet of the resume viewer: the profile snapshot, or a note for a file that cannot be previewed.
const ApplicantDocument = ({ chip, name, sub, profile, now }: { chip: DocChip; name: string; sub: string; profile?: Profile; now: number }) => {
  if (chip.file) {
    return (
      <div className="box resume-sheet resume-file">
        <Icon name="doc" size={28} />
        <p className="b1 w7">{chip.label}</p>
        <p className="b2 t3">{DOCUMENT_EMPTY}</p>
      </div>
    )
  }
  const careers = careerRows(profile?.careers ?? [], now)
  const sections = [
    chip.content
      ? { title: SHEET_INTRO, body: <p className="b2 t2 resume-intro">{chip.content}</p> }
      : null,
    careers.length
      ? {
          title: SHEET_CAREERS,
          body: (
            <ul className="resume-timeline">
              {careers.map((career) => (
                <li key={career.key}>
                  <i className="resume-dot" />
                  <div>
                    <p className="b1 w7">{career.title}</p>
                    <p className="c1 t3">{career.period}</p>
                    {career.summary ? <p className="b2 t2 resume-summary">{career.summary}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          ),
        }
      : null,
    profile?.skills.length
      ? {
          title: SHEET_SKILLS,
          body: (
            <div className="resume-skills">
              {profile.skills.map((skill) => (
                <span key={skill} className="chip">
                  {skill}
                </span>
              ))}
            </div>
          ),
        }
      : null,
  ].filter((section) => section !== null)
  return (
    <div className="box resume-sheet">
      <div className="resume-who">
        <span className="av resume-av" style={{ background: brandColor(name) }}>
          {memberInitials(name)}
        </span>
        <span>
          <span className="h2">{name}</span>
          <span className="c1 t3">{sub}</span>
        </span>
      </div>
      {sections.map((section, index) => (
        <Fragment key={section.title}>
          {index ? <div className="biz-hr" /> : null}
          <section className="resume-section">
            <h2 className="b2 w8">{section.title}</h2>
            {section.body}
          </section>
        </Fragment>
      ))}
    </div>
  )
}

export default ApplicantDocument
