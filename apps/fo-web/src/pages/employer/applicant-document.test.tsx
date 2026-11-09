import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import ApplicantDocument from './applicant-document'
import { FILE_DOWNLOAD, SHEET_LIVE } from './constants'

const profile = {
  displayName: '김태윤',
  email: 'taeyoon.kim@gmail.com',
  headline: '백엔드 엔지니어',
  careers: [{ company: '모아페이', role: '백엔드 엔지니어', startedOn: '2022-03-01', endedOn: null, description: '' }],
  skills: ['Kotlin'],
  hubProfileId: null,
}
const badge = { label: '프로필', tone: 'ac' as const }

describe('ApplicantDocument', () => {
  it('says careers and skills are today’s profile, apart from the submitted text', () => {
    const html = renderToStaticMarkup(
      <ApplicantDocument chip={{ key: 'd1', label: '이력서', badge, content: '소개 글', file: null }} name="김태윤" sub="" profile={profile} now={0} />,
    )
    expect(html).toContain(SHEET_LIVE)
    expect(html.indexOf('소개 글')).toBeLessThan(html.indexOf(SHEET_LIVE))
  })

  it('offers the attached file for download', () => {
    const html = renderToStaticMarkup(
      <ApplicantDocument chip={{ key: 'f1', label: '포트폴리오.pdf · 14쪽', badge, content: '', file: { id: 'f1', name: '포트폴리오.pdf' } }} name="김태윤" sub="" now={0} />,
    )
    expect(html).toContain(FILE_DOWNLOAD)
  })
})
