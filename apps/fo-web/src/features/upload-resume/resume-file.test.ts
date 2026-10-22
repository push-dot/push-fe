import { describe, expect, it } from 'vitest'
import { resumeFileError } from './resume-file'

const MB = 1024 * 1024

describe('resumeFileError', () => {
  it('accepts a pdf or docx at 20MB', () => {
    expect(resumeFileError({ name: '이력서.pdf', type: 'application/pdf', size: 20 * MB })).toBeNull()
    expect(
      resumeFileError({
        name: '이력서.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 20 * MB,
      }),
    ).toBeNull()
  })

  it('rejects files over 20MB', () => {
    expect(resumeFileError({ name: '이력서.pdf', type: 'application/pdf', size: 20 * MB + 1 })).toBe(
      '20MB 이하 파일만 올릴 수 있어요',
    )
  })

  it('rejects files that are not pdf or docx', () => {
    expect(resumeFileError({ name: '이력서.png', type: 'image/png', size: 1000 })).toBe(
      'PDF 또는 DOCX 파일만 올릴 수 있어요',
    )
  })
})
