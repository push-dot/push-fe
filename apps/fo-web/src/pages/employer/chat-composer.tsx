import type { FormEvent } from 'react'
import { APPLICANT_ATTACH, APPLICANT_NONE, COMPOSER_LABEL, PDF_ATTACH, PDF_LOCK, SEND_MESSAGE } from './constants'

type Person = { applicationId: string; name: string }

type ChatComposerProps = {
  text: string
  sending: boolean
  applicationId: string
  people: Person[]
  applicantName: string | null
  pdfDisabled: boolean
  showPdfNote: boolean
  onText: (value: string) => void
  onApplication: (value: string) => void
  onFile: (file: File) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const ChatComposer = ({
  text,
  sending,
  applicationId,
  people,
  applicantName,
  pdfDisabled,
  showPdfNote,
  onText,
  onApplication,
  onFile,
  onSubmit,
}: ChatComposerProps) => (
  <form className="stack form" onSubmit={onSubmit}>
    <label className="field">
      {APPLICANT_ATTACH}
      <select value={applicationId} onChange={(event) => onApplication(event.target.value)}>
        <option value="">{APPLICANT_NONE}</option>
        {people.map((person) => (
          <option key={person.applicationId} value={person.applicationId}>
            {person.name}
          </option>
        ))}
      </select>
    </label>
    {applicantName ? <span className="chip">{applicantName}</span> : null}
    <label className="field">
      {PDF_ATTACH}
      <input
        type="file"
        accept="application/pdf,.pdf"
        disabled={pdfDisabled}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onFile(file)
        }}
      />
    </label>
    {showPdfNote ? <p className="b2 t3">{PDF_LOCK}</p> : null}
    <label className="field">
      {COMPOSER_LABEL}
      <textarea rows={4} value={text} onChange={(event) => onText(event.target.value)} />
    </label>
    <button className="primary" type="submit" disabled={sending || text.trim().length === 0}>
      {SEND_MESSAGE}
    </button>
  </form>
)

export default ChatComposer
