import type { CompanyPosting } from '@push/api-client'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '../../shared/ui/icon'
import { Menu, Popover, type MenuItem } from '../../shared/ui/popover'
import { APPLICANTS_LINK, APPLICANT_UNIT, POSTINGS_HEAD, POSTING_APPLICANTS, POSTING_CLOSE, POSTING_EDIT, POSTING_MORE, newApplicants } from './constants'
import { STATUS_BADGE, deadlineLabel, statusOf, subLine } from './posting-view'

const RowMore = ({ items }: { items: MenuItem[] }) => {
  const [open, setOpen] = useState(false)
  return (
    <span className="biz-more">
      <button type="button" className="hbtn" aria-label={POSTING_MORE} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name="more" size={20} width={3} />
      </button>
      {open ? (
        <Popover label={POSTING_MORE} onClose={() => setOpen(false)} className="biz-pop">
          <Menu items={items} onClose={() => setOpen(false)} />
        </Popover>
      ) : null}
    </span>
  )
}

const PostingRow = ({ posting, now, onClose }: { posting: CompanyPosting; now: number; onClose: (posting: CompanyPosting) => void }) => {
  const status = statusOf(posting)
  const badge = STATUS_BADGE[status]
  const applicants = `/employer/postings/${posting.id}/applicants`
  const items: MenuItem[] = [
    { label: POSTING_EDIT, icon: 'pencil', to: `/employer/postings/${posting.id}/edit` },
    { label: POSTING_APPLICANTS, icon: 'people', to: applicants },
    ...(status === 'CLOSED' ? [] : [{ divider: true } as const, { label: POSTING_CLOSE, icon: 'ban' as const, danger: true, onSelect: () => onClose(posting) }]),
  ]
  return (
    <li className="biz-row">
      <Link className="biz-main" to={`/employer/postings/${posting.id}/edit`}>
        <strong className="b1 w7 cap">{posting.title}</strong>
        <span className="c1 t3 cap">{subLine(posting, now)}</span>
      </Link>
      <span className={`badge ${badge.tone} biz-status`}>{badge.label}</span>
      <Link className="b2 num biz-count" to={applicants}>
        <span className="biz-label">{POSTINGS_HEAD[2]}</span>
        {posting.applicantCount === undefined ? (
          <span className="w7 ac">{APPLICANTS_LINK}</span>
        ) : (
          <>
            <b className="w8">{posting.applicantCount}</b>
            <span className="t3">{APPLICANT_UNIT}</span>
            {posting.newApplicantCount ? <span className="badge ac">{newApplicants(posting.newApplicantCount)}</span> : null}
          </>
        )}
      </Link>
      <span className="b2 t2 num biz-date">
        <span className="biz-label">{POSTINGS_HEAD[3]}</span>
        {deadlineLabel(posting)}
      </span>
      <RowMore items={items} />
    </li>
  )
}

export default PostingRow
