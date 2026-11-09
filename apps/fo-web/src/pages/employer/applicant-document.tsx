import { brandColor } from '@push/shared'
import type { ApplicantDetail } from '@push/api-client'
import { Fragment } from 'react'

import { Icon } from '../../shared/ui/icon'
import { careerRows, type DocChip } from './applicant-view'
import { DOCUMENT_EMPTY, FILE_DOWNLOAD, SHEET_CAREERS, SHEET_INTRO, SHEET_LIVE, SHEET_SKILLS, memberInitials } from './constants'

type Profile = NonNullable<ApplicantDetail['applicant']>

type SheetProps = { chip: DocChip; name: string; sub: string; profile?: Profile; now: number; downloading?: boolean; onDownload?: () => void }

// The white sheet of the resume viewer: the submitted text with today's profile careers and skills, or an attached file to download.
const ApplicantDocument = ({ chip, name, sub, profile, now, downloading = false, onDownload }: SheetProps) => {
  if (chip.file) {
    return (
      <div className="box resume-sheet resume-file">
        <Icon name="doc" size={28} />
        <p className="b1 w7">{chip.label}</p>
        <p className="b2 t3">{DOCUMENT_EMPTY}</p>
        <button type="button" className="btn sec sm" disabled={downloading} onClick={onDownload}>
          <Icon name="download" size={16} width={2.2} />
          {FILE_DOWNLOAD}
        </button>
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
          live: true,
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
          live: true,
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
  const firstLive = sections.find((section) => 'live' in section)
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
          {section === firstLive ? <p className="c1 t3">{SHEET_LIVE}</p> : null}
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
