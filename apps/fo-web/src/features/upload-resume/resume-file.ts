const MAX_BYTES = 20 * 1024 * 1024
const PDF = 'application/pdf'
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const resumeFileError = (file: { name: string; type: string; size: number }) => {
  const name = file.name.toLowerCase()
  const pdf = file.type === PDF || name.endsWith('.pdf')
  const docx = file.type === DOCX || name.endsWith('.docx')
  if (!pdf && !docx) return 'PDF 또는 DOCX 파일만 올릴 수 있어요'
  if (file.size > MAX_BYTES) return '20MB 이하 파일만 올릴 수 있어요'
  return null
}
